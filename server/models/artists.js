const mongoose = require('mongoose');

const Track = new mongoose.Schema({
  name: String,
  normalizedName: { type: String, index: true },
  spotifyId: { type: String, index: true },
  playlistIds: [String]
});

const Artist = new mongoose.Schema({
  name: { type: String, index: true },
  spotifyId: { type: String, index: true },
  tracks: [Track]
});

module.exports = mongoose.model('Artist', Artist);
