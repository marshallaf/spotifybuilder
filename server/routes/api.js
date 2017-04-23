const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
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
    const spotifyPlaylists = playlists.map(playlist => ({name: playlist.name, id: playlist.id, role: 'none'}));
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

  const barn = newPlaylists.find(playlist => playlist.role === 'barn');

  console.log(newPlaylists[1]);

  const promises = new Array(saveUserPlaylists(req.user, newPlaylists), 
                             getPlaylistTracks(req.user.spotify.id, req.user.spotify.accessToken, newPlaylists[1]));
  Promise.all(promises)
  .then(resArr => {
    console.log(resArr[1]);
    const idsToAdd = resArr[1].map(track => `spotify:track:${track.track.id}`);
    addTracksToBarn(req.user.spotify.id, req.user.spotify.accessToken, barn, idsToAdd)
    .then(() => console.log('success!'))
    .catch(err => console.log(err));
    res.status(200).end();
  });
})

function saveUserPlaylists(user, playlists) {
  // remove playlists that don't have a role
  const newPlaylists = playlists.filter(playlist => playlist.role !== 'none');

  return new Promise((resolve, reject) => {
    User.findById(user._id, 'playlists', (err, foundUser) => {
      if (err) reject(err);

      // store playlists
      foundUser.playlists = newPlaylists;
      foundUser.save(err => {
        if (err) reject(err);
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

  // TODO: since I don't have more than 50 playlists, this isn't a problem for me, but...
  // it only lets you get 50 at a time, so we need to use a promise.all type structure to get all the pages
  // and it probably rate-limits you so you'll need to stagger the promises
  // see JMPerez/spotify-dedup/app/scripts/main.js:226 (promisesForPages) for paging
  // and npm promise-throttle for staggering the requests

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

function getPlaylistTracks(userId, accessToken, playlist) {

  const spotifyReq = axios.create({
    method: 'get',
    url: `https://api.spotify.com/v1/users/${userId}/playlists/${playlist.id}/tracks`,
    headers: {'Authorization': `Bearer ${accessToken}`},
    params: { fields: 'items(track(name,artists(name),id,explicit))'},
  });

  return new Promise((resolve, reject) => {
    spotifyReq()
    .then(response => {
      if (response.status === 200) {
        const tracks = response.data.items;
        resolve(tracks);
      } else reject();
    })
    .catch(err => {
      console.log(err.response.data.error);
      reject();
    });
  });
}

function addTracksToBarn(userId, accessToken, barn, tracks) {
  
  return new Promise((resolve, reject) => {
    axios.post(`https://api.spotify.com/v1/users/${userId}/playlists/${barn.id}/tracks`,
                     {uris: tracks},
                     {headers: {'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json'}})
    .then(response => {
      console.log(response.config);
      if (response.status === 201) resolve();
      else reject('response received but it wasn\'t good');
    })
    .catch(err => {
      console.log(err);
      reject('error during request');
    });
  });
}

module.exports = router;