const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const OldPlaylist = new mongoose.Schema({
  name: String,
  id: String,
  role: String,
  href: String,
  owned: Boolean,
});

const OldTrack = new mongoose.Schema({
  name: String,
  artist: String,
  spotifyId: String,
  userIds: [String]
});

const OldUser = new mongoose.Schema({
  spotify: {
    id: String,
    displayName: String,
    href: String,
    image: String,
    accessToken: String,
    refreshToken: String,
  },
  playlists: [OldPlaylist],
  seenTracks: [OldTrack]
});

module.exports = mongoose.model('OldUser', OldUser);
