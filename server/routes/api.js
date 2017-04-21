const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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

// GET /api/spotify/playlists, gets list of user's playlists from spotify
router.get('/spotify/playlists', (req, res) => {
  if (!req.user) return res.status(401).end();

  const spotifyToken = req.user.spotify.accessToken;
  const spotifyId = req.user.spotify.id;

  axios.get(`https://api.spotify.com/v1/users/${spotifyId}/playlists?limit=50`,
    {
      headers: {'Authorization': `Bearer ${spotifyToken}`},
    }
  )
  .then(response => {
    if (response.status === 200) {
      console.log(response.data.items[0]);
    }
    res.status(200).end();
  })
  .catch(err => {
    console.log(err.response.data.error);
  });
});

module.exports = router;