const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/users');

const router = express.Router();
router.use(cookieParser());

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
    const spotifyPlaylists = playlists.map(playlist => ({name: playlist.name, id: playlist.id}));
    console.log(spotifyPlaylists);
  });
});

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
      console.log(response.data.items[0].name);
      console.log(response.data.total);
      console.log(response.data.next);
      return cb(playlists);
    }
  })
  .catch(err => {
    console.log(err.response.data.error);
    return cb(null);
  });
}

module.exports = router;