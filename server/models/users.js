
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const Playlist = new mongoose.Schema({
  name: String,
  id: String,
  role: String,
  href: String,
  owned: Boolean,
});

const User = new mongoose.Schema({
  spotify: {
    id: String,
    displayName: String,
    href: String,
    image: String,
    accessToken: String,
    refreshToken: String,
  },
  playlists: [Playlist],
});

module.exports = mongoose.model('User', User);
