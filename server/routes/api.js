const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const axios = require('axios');
const PromiseThrottle = require('promise-throttle');
const User = require('../models/users');
const Artist = require('../models/artists');

const router = express.Router();
router.use(cookieParser());
router.use(bodyParser.json());

// GET /api/user, gets user from header and returns to requester
router.get('/user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Session no longer valid.' });
  }

  return res.status(200).json(req.user);
});

// GET /api/playlists, gets list of user's playlists
router.get('/playlists', (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Session no longer valid.' });
    return;
  }

  const { user } = req;

  getSpotifyPlaylists(user.spotifyId, user.accessToken)
    .then(playlists =>
      playlists.map(playlist => ({
        name: playlist.name,
        spotifyId: playlist.id,
        href: playlist.href,
        owned: playlist.owner.id === user.spotifyId,
        role: 'none'
      }))
    )
    .then(playlistsFromApi =>
      User.findOne({ spotifyId: user.spotifyId }, 'playlists').then(dbUser => {
        // determine playlist roles
        dbUser.playlists.forEach(userPlaylist => {
          const matchingApiPlaylist = playlistsFromApi.find(
            item => item.spotifyId === userPlaylist.spotifyId
          );
          if (!matchingApiPlaylist) return;

          matchingApiPlaylist.role = userPlaylist.role;
        });

        // store new set of playlists
        dbUser.set({ playlists: playlistsFromApi });
        return new Promise((resolve, reject) => {
          dbUser
            .save()
            .then(() => resolve(playlistsFromApi))
            .catch(err => reject(err));
        });
      })
    )
    .then(playlists => res.status(200).json(playlists))
    .catch(() => res.status(500).json({ error: "Error getting user's playlists." }));
});

router.post('/playlists', (req, res) => {
  if (!req.user) res.status(401).json({ error: 'Session no longer valid.' });
  if (!req.body.data.playlists) res.status(400).json({ error: 'POST to /api/playlists must contain a playlists object.' });

  saveUserPlaylists(req.user, req.body.data.playlists)
    .then(() => res.status(200).end())
    .catch(() => res.status(500).json({ error: "Error saving user's playlists." }));
});

router.post('/aggregate', (req, res) => {
  if (!req.user) res.status(401).json({ error: 'Session no longer valid.' });
  if (!req.body.data.playlists) res.status(400).json({ error: 'POST to /api/aggregate must contain a playlists object.' });

  const roledPlaylists = req.body.data.playlists.filter(playlist => playlist.role !== 'none');

  const barnIndex = roledPlaylists.findIndex(playlist => playlist.role === 'barn');
  const sheepPlaylists = [...roledPlaylists];
  const [barn] = sheepPlaylists.splice(barnIndex, 1);

  const promises = [
    saveUserPlaylists(req.user, roledPlaylists),
    getAllPlaylistTracks(req.user.spotifyId, req.user.accessToken, sheepPlaylists)
  ];

  // we have all the tracks from the playlists, and we've saved the playlists to the db
  // now we hit the Spotify API to add them to the barn playlist
  Promise.all(promises)
    .then(resolvedPromises => resolvedPromises[1])
    .then(tracks => deduplicateAndFormat(tracks))
    .then(artists => {
      const artistSavePromises = [];

      Object.values(artists).forEach(artist => {
        const artistPromise = Artist.findOneAndUpdate(
          { $or: [{ name: artist.name }, { spotifyId: artist.spotifyId }] },
          {
            $setOnInsert: {
              name: artist.name,
              spotifyId: artist.spotifyId
            }
          },
          {
            upsert: true,
            new: true
          }
        ).then(dbArtist => filterTracksForArtist(dbArtist, artist, barn.id));
        artistSavePromises.push(artistPromise);
      });
      return Promise.all(artistSavePromises);
    })
    .then(nestedArrOfTracks =>
      nestedArrOfTracks.reduce((allTracks, trackList) => allTracks.concat(...trackList), [])
    )
    .then(newTrackIds => newTrackIds.map(trackId => buildSpotifyUri(trackId)))
    .then(newTrackUris =>
      addAllTracksToBarn(req.user.spotifyId, req.user.accessToken, barn, newTrackUris)
    )
    .then(numberOfTracksAdded => {
      console.log(`Added ${numberOfTracksAdded} tracks to ${barn.name}.`);
      res.status(200).json({ success: `Added ${numberOfTracksAdded} tracks to ${barn.name}.` });
    })
    .catch(bundleErr => {
      console.log(bundleErr);
      res.status(500).json({ error: 'Error bundling playlists.' });
    });
});

function filterTracksForArtist(dbArtist, newArtist, barnId) {
  const artistSongIdsToAdd = [];
  const newTracks = newArtist.tracks;
  const dbArtistTracks = dbArtist.tracks;
  Object.values(newTracks).forEach(newTrack => {
    // check each new track against the db
    const dbTrack = dbArtistTracks.find(
      item =>
        item.spotifyId === newTrack.spotifyId || item.normalizedName === newTrack.normalizedName
    );
    if (dbTrack) {
      // this track has already been stored to the db - check if it's been stored to this barn
      if (!dbTrack.playlistIds.includes(barnId)) {
        // this track hasn't been stored to this barn yet, add it
        dbTrack.playlistIds.push(barnId);
        artistSongIdsToAdd.push(newTrack.spotifyId);
      }
    } else {
      // this track has not been stored to this artist yet, add it
      dbArtist.tracks.push({
        name: newTrack.name,
        spotifyId: newTrack.spotifyId,
        normalizedName: newTrack.normalizedName,
        playlistIds: [barnId]
      });
      artistSongIdsToAdd.push(newTrack.spotifyId);
    }
  });
  return new Promise((resolve, reject) => {
    dbArtist
      .save()
      .then(() => resolve(artistSongIdsToAdd))
      .catch(saveErr => reject(saveErr));
  });
}

function buildSpotifyUri(trackId) {
  return `spotify:track:${trackId}`;
}

function normalize(original) {
  const normalized = original.toLowerCase();
  const symbols = new RegExp("[`~!@#$%^&*()\\s\\.,+=\\-'\\[\\]\\{}|\\<\\>?]", 'g');
  return normalized.replace(symbols, '');
}

function deduplicateAndFormat(tracks) {
  // sorting by explicit will make the de-dupe step to prefer the
  // explicit version, if there are both
  tracks.sort((track1, track2) => {
    if (track1.explicit && track2.explicit) return 0;
    if (!track1.explicit) return 1;
    return -1;
  });

  // remove duplicates from the full list of tracks
  // and restructure into db format
  const artists = {};
  tracks.forEach(track => {
    const artistName = track.artists[0].name;
    if (!Object.prototype.hasOwnProperty.call(artists, artistName)) {
      artists[artistName] = {
        name: artistName,
        spotifyId: track.artists[0].id,
        tracks: {}
      };
    }

    const normalizedTrackName = normalize(track.name);
    if (!Object.prototype.hasOwnProperty.call(artists[artistName].tracks, normalizedTrackName)) {
      artists[artistName].tracks[normalizedTrackName] = {
        name: track.name,
        spotifyId: track.id,
        normalizedName: normalizedTrackName
      };
    }
  });

  return artists;
}

function saveUserPlaylists(user, playlists) {
  return User.findOneAndUpdate({ spotifyId: user.spotifyId }, { playlists }, { new: true });
}

function getSpotifyPlaylists(userId, accessToken) {
  // create a base axios config
  const spotifyReq = axios.create({
    method: 'get',
    url: `https://api.spotify.com/v1/users/${userId}/playlists?limit=50`,
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  // TODO: refactor to use paging and promise-throttle

  // actually make the request
  return new Promise((resolve, reject) => {
    spotifyReq()
      .then(response => {
        if (response.status === 200) {
          resolve(response.data.items);
        } else {
          reject();
        }
      })
      .catch(err => {
        console.log(err.response.data.error);
        reject();
      });
  });
}

function getAllPlaylistTracks(userId, accessToken, playlists) {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 10,
    promiseImplementation: Promise
  });

  const promises = playlists.map(
    playlist =>
      promiseThrottle.add(
        // you can either do it like this:
        getPlaylistTracks.bind(this, accessToken, playlist)
      )
    // or in an anon no-arg function def:
    // function() {
    //    return getPlaylistTracks(userId, accessToken, playlist);
    // }
    // I'm not sure of the pros/cons of each, if any.
  );

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(arraysOfPlaylistTracks => {
        const tracks = arraysOfPlaylistTracks
          .reduce(
            (allTracks, trackList) => allTracks.concat(trackList.map(track => track.track)),
            []
          )
          .filter(track => track);
        resolve(tracks);
      })
      .catch(err => reject(err));
  });
}

function getPlaylistTracks(accessToken, playlist) {
  const requestConfig = {
    method: 'get',
    url: `${playlist.href}/tracks`,
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { fields: 'items(track(name,artists(name),id,explicit)),total', limit: 100 }
  };
  console.log(requestConfig);

  return new Promise((resolve, reject) => {
    pagePromises(requestConfig)
      .then(promises => {
        Promise.all(promises).then(trackPages => {
          const tracks = trackPages.reduce((allTracks, page) => allTracks.concat(page.items), []);
          resolve(tracks);
        });
      })
      .catch(err => reject(err));
  });
}

function addTracksToBarn(userId, accessToken, barn, tracks) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `https://api.spotify.com/v1/users/${userId}/playlists/${barn.spotifyId}/tracks`,
        { uris: tracks },
        { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
      )
      .then(response => {
        if (response.status === 201) resolve();
        else reject(Error(`Error: Spotify API responded with unsuccessful status ${response.status}.`));
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

function addAllTracksToBarn(userId, accessToken, barn, tracks) {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 10,
    promiseImplementation: Promise
  });

  const numTracks = tracks.length;
  if (tracks.length <= 0) {
    return new Promise(resolve => resolve(0));
  }

  const promises = [];
  for (let tracksAdded = 0; tracksAdded <= numTracks; tracksAdded += 100) {
    if (tracksAdded + 99 <= numTracks) {
      promises.push(
        promiseThrottle.add(
          addTracksToBarn.bind(
            this,
            userId,
            accessToken,
            barn,
            tracks.slice(tracksAdded, tracksAdded + 100)
          )
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

  return new Promise((resolve, reject) =>
    Promise.all(promises)
      .then(() => resolve(numTracks))
      .catch(err => reject(err))
  );
}

function pagePromises(axiosConfig) {
  // thanks to github.com/JMPerez for this function

  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 10,
    promiseImplementation: Promise
  });

  return new Promise((resolve, reject) => {
    axios
      .request(Object.assign({}, axiosConfig, { params: { limit: 1 } }))
      .then(response => {
        const promises = [];
        let offset = 0;
        while (response.data.total > offset) {
          const newParams = Object.assign({}, axiosConfig.params, { offset });
          const subsetConfig = Object.assign({}, axiosConfig, { params: newParams });
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
    axios
      .request(axiosConfig)
      .then(response => {
        resolve(response.data);
      })
      .catch(err => reject(err));
  });
}

module.exports = router;
