
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const User = new mongoose.Schema({
  spotify: {
    id: String,
    access_token: String,
    refresh_token: String,
  }
});

module.exports = mongoose.model('User', User);