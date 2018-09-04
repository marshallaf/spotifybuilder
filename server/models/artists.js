const mongoose = require('mongoose');

const Track = new mongoose.Schema({
  name: String,
  spotifyId: String,
  userIds: [String]
});

const Artist = new mongoose.Schema({
  name: String,
  spotifyId: String,
  tracks: [Track]
});

module.exports = mongoose.model('Artist', Artist);
