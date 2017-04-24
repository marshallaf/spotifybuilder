const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const PromiseThrottle = require('promise-throttle');
const md5 = require('md5');
const User = require('../models/users');

const router = express.Router();
router.use(cookieParser());
router.use(bodyParser.json());

// GET /api/user, gets user from header and returns to requester
router.get('/user', (req, res) => {
  if (!req.user) {
    console.log('there is no user');
    return res.status(401).end();
  }

  return res.status(200).json(req.user);
});

// GET /api/playlists, gets list of user's playlists
router.get('/playlists', (req, res) => {
  if (!req.user) return res.status(401).end();

  getSpotifyPlaylists(req.user.spotify.id, req.user.spotify.accessToken, playlists => {
    if (!playlists) return res.status(404).end();
    const spotifyPlaylists = playlists.map(playlist => {
      return {
        name: playlist.name,
        id: playlist.id, 
        href: playlist.href, 
        owned: playlist.owner.id == req.user.spotify.id,
        role: 'none'
      };
    });
    User.findById(req.user._id, 'playlists', (err, user) => {
      if (err) throw err;
      // determine playlist roles
      const newPlaylists = [];
      user.playlists.forEach(playlist => {
        const sPlaylist = spotifyPlaylists.find(spl => spl.id === playlist.id);
        if (!sPlaylist) return;
        sPlaylist.role = playlist.role;
        newPlaylists.push(sPlaylist);
      });
      // store new set of playlists
      user.playlists = newPlaylists;
      user.save(err => {
        if (err) throw err;
        return res.status(200).json(spotifyPlaylists);
      });
    });
  });
});

router.post('/playlists', (req, res) => {
  if (!req.user) return res.status(401).end();
  if (!req.body.data.playlists) return res.status(400).end();

  saveUserPlaylists(req.user, req.body.data.playlists)
  .then(() => res.status(200).end());
});

router.post('/aggregate', (req, res) => {
  if (!req.user) return res.status(401).end();
  if (!req.body.data.playlists) return res.status(400).end();

  // this is redundant, so take it out of here, or from saveUserPlaylists
  const newPlaylists = req.body.data.playlists.filter(playlist => playlist.role !== 'none');

  const barnIndex = newPlaylists.findIndex(playlist => playlist.role === 'barn');
  const barn = newPlaylists[barnIndex];
  newPlaylists.splice(barnIndex, 1);

  const promises = new Array(saveUserPlaylists(req.user, newPlaylists), 
                             getAllPlaylistTracks(req.user.spotify.id, req.user.spotify.accessToken, newPlaylists));

  // we have all the tracks from the playlists, and we've save the playlists to the db
  // now we hit the Spotify API to add them to the barn playlist
  Promise.all(promises)
  .then(resArr => {
    // returned is an array of arrays of tracks
    // this puts them into one large array of all the tracks
    const tracks = resArr[1].reduce((allTracks, trackList) => {
      return allTracks.concat(trackList.map(track => track.track));
    }, []);

    // sorting by explicit will make the de-dupe step to prefer the explicit version, if there are both
    tracks.sort((a, b) => {
      if (a.explicit && b.explicit) return 0;
      else if (!a.explicit) return 1;
      else return -1;
    });

    // remove duplicates from the full list of tracks
    const seenMD5s = {};
    const uniqueTracks = [];
    tracks.forEach(track => {
      track.md5 = md5(`${track.name}:${track.artists[0].name}`);
      if (!(track.md5 in seenMD5s)) {
        seenMD5s[track.md5] = true;
        uniqueTracks.push({
          name: track.name,
          artist: track.artists[0].name,
          spotifyId: track.id,
          _id: track.md5,
        });
      }
    });

    User.findById(req.user._id, 'seenTracks', (err, user) => {
      if (err) {
        console.log('error reading database', err);
        res.status(500).end();
      }

      // removes tracks the user has bundled in the past
      const doubleUniqueTracks = uniqueTracks.filter(track => {
        return !(user.seenTracks.id(track._id));
      });

      // create an array of the song URIs that the Spotify API expects
      const idsToAdd = doubleUniqueTracks.map(track => `spotify:track:${track.spotifyId}`);

      addAllTracksToBarn(req.user.spotify.id, req.user.spotify.accessToken, barn, idsToAdd)
      .then(() => {
        console.log('saving tracks');
        user.seenTracks.push(...doubleUniqueTracks);
        user.save(err => {
          if (err) {
            console.log('/api/aggregate::', err, '::');
            return res.status(500).end();
          }
          return res.status(200).end();
        });
      })
      .catch(err => {
        console.log('/api/aggregate::', err, '::');
        return res.status(500).end();
      });
    });
  })
  .catch(err => {
    console.log('/api/aggregate::', err, '::');
    res.status(500).end();
  });
});

function saveUserPlaylists(user, playlists) {

  return new Promise((resolve, reject) => {
    User.findById(user._id, 'playlists', (err, foundUser) => {
      if (err) reject('error finding user: ' + err);

      // store playlists
      foundUser.playlists = playlists;
      foundUser.save(err => {
        if (err) reject('error saving user: ' + err);
        resolve();
      });
    });
  });
}

function getSpotifyPlaylists(userId, accessToken, cb) {
  // create a base axios config
  const spotifyReq = axios.create({
    method: 'get',
    url: `https://api.spotify.com/v1/users/${userId}/playlists?limit=50`,
    headers: {'Authorization': `Bearer ${accessToken}`},
  });

  // TODO: refactor to use paging and promise-throttle

  // actually make the request
  spotifyReq()
  .then(response => {
    if (response.status === 200) {
      const playlists = response.data.items;
      return cb(playlists);
    }
  })
  .catch(err => {
    console.log(err.response.data.error);
    return cb(null);
  });
}

function getAllPlaylistTracks(userId, accessToken, playlists) {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 10,
    promiseImplementation: Promise,
  });

  const promises = playlists.map(playlist => promiseThrottle.add(
    // you can either do it like this:
    getPlaylistTracks.bind(this, userId, accessToken, playlist))
    // or in an anon no-arg function def:
    // function() {
    //    return getPlaylistTracks(userId, accessToken, playlist);
    // }
    // I'm not sure of the pros/cons of each, if any.
  );

  return Promise.all(promises);
}

function getPlaylistTracks(userId, accessToken, playlist) {
  
  const reqConfig = {
    method: 'get',
    url: `${playlist.href}/tracks`,
    headers: {'Authorization': `Bearer ${accessToken}`},
    params: { fields: 'items(track(name,artists(name),id,explicit)),total', limit: 100},
  };

  return new Promise((resolve, reject) => {
    pagePromises(reqConfig)
    .then(promises => {
      Promise.all(promises)
      .then(resArr => {
        const tracks = resArr.reduce((allTracks, page) => {
          return allTracks.concat(page.items);
        }, []);
        resolve(tracks);
      });
    });
  });
}

function addTracksToBarn(userId, accessToken, barn, tracks) {
  return new Promise((resolve, reject) => {
    axios.post(`https://api.spotify.com/v1/users/${userId}/playlists/${barn.id}/tracks`,
                     {uris: tracks},
                     {headers: {'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json'}})
    .then(response => {
      if (response.status === 201) resolve();
      else reject('response received but it wasn\'t good');
    })
    .catch(err => {
      console.log(err.response.data.error);
      reject('error during request');
    });
  });
}

function addAllTracksToBarn(userId, accessToken, barn, tracks) {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 10,
    promiseImplementation: Promise,
  });

  const numTracks = tracks.length;
  const promises = [];
  for (let tracksAdded = 0; tracksAdded <= numTracks; tracksAdded += 100) {
    if (tracksAdded + 99 <= numTracks) {
      promises.push(
        promiseThrottle.add(
          addTracksToBarn.bind(this, userId, accessToken, barn, tracks.slice(tracksAdded, tracksAdded + 100))
        )
      );
    } else {
      promises.push(
        promiseThrottle.add(
          addTracksToBarn.bind(this, userId, accessToken, barn, tracks.slice(tracksAdded))
        )
      );
    }
  }

  return Promise.all(promises);
}

function pagePromises(axiosConfig) {
  // thanks to github.com/JMPerez for this function

  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 10,
    promiseImplementation: Promise,
  });

  return new Promise((resolve, reject) => {
    axios.request(Object.assign({}, axiosConfig, {params: {limit: 1}}))
    .then(response => {
      const promises = [];
      let offset = 0;
      while (response.data.total > offset) {
        const newParams = Object.assign({}, axiosConfig.params, {offset});
        const subsetConfig = Object.assign({}, axiosConfig, {params: newParams});
        promises.push(promiseThrottle.add(getItems.bind(this, subsetConfig)));
        offset += axiosConfig.params.limit;
      }
      resolve(promises);
    })
    .catch(err => {
      reject(err);
    });
  });
}

function getItems(axiosConfig) {
  return new Promise((resolve, reject) => {
    axios.request(axiosConfig)
    .then(response => {
      resolve(response.data);
    })
    .catch(err => reject(err));
  });
}

module.exports = router;