
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const User = new mongoose.Schema({
  spotify: {
    id: String,
    displayName: String,
    href: String,
    image: String,
  }
});

module.exports = mongoose.model('User', User);