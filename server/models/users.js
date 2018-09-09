const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const Playlist = new mongoose.Schema({
  name: String,
  spotifyId: String,
  role: String,
  href: String,
  owned: Boolean
});

const User = new mongoose.Schema({
  spotifyId: String,
  displayName: String,
  href: String,
  image: String,
  accessToken: String,
  refreshToken: String,
  playlists: [Playlist]
});

module.exports = mongoose.model('User', User);
