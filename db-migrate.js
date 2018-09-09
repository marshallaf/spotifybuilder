const path = require('path');
const mongoose = require('mongoose');
const OldUser = require('./server/models/old-users');
const User = require('./server/models/users');
const Artist = require('./server/models/artists');

// load environment variables if in dev
if (process.env.DEV_MODE === 1) {
  require('dotenv').load();
}

// connect to database
mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

OldUser.find({}).exec()
  .then(userList => {
    userList.forEach(user => {
      saveUserToUserDb(user);
      saveTracksToArtistDb(user.seenTracks);
    });
  })
  .catch(err => console.log(err));

function saveTracksToArtistDb(tracks) {
  tracks.forEach(track => {
    Artist.findOneAndUpdate(
      { name: track.artist },
      {
        name: track.artist,

      }
    )
      .exec()
      .then(data => {

      })
      .catch(err => console.log(err));
  });
}
