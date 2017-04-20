
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const User = new mongoose.Schema({
  spotify: {
    id: String,
    displayName: String,
    href: String,
    image: String,
    accessToken: String,
    refreshToken: String,
  }
});

module.exports = mongoose.model('User', User);