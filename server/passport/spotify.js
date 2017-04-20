const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('../models/users');
const jwt = require('jsonwebtoken');

module.exports = new SpotifyStrategy(
  {
    clientID: process.env.SPOTIFY_KEY,
    clientSecret: process.env.SPOTIFY_SECRET,
    callbackURL: process.env.APP_URL + '/auth/spotify/callback',
  },
  (accessToken, refreshToken, profile, done) => {
    // makes it async
    process.nextTick(() => {
      User.findOne({ 'spotify.id': profile.id }, (err, user) => {
        if (err) return done(err);
        if (user) {
          // user was found, update their tokens
          user.spotify.accessToken = accessToken;
          user.spotify.refreshToken = refreshToken;
          console.log(user);

          const token = createJWT(user);

          // return to routing (/auth/login)
          done(null, token, user);
        } else {
          // user is new, add to database
          const newUser = new User();
          console.log(profile._json);
          newUser.spotify.id = profile._json.id;
          newUser.spotify.displayName = profile._json.display_name;
          newUser.spotify.href = profile._json.href;
          newUser.spotify.image = profile._json.images[0].url;
          newUser.spotify.accessToken = accessToken;
          newUser.spotify.refreshToken = refreshToken;

          newUser.save(err => {
            if (err) throw err;
            console.log(newUser);

            const token = createJWT(newUser); // does the new user have an id?

            return done(null, token, newUser);
          });
        }
      });
    });
  }
);

function createJWT(user) {
  // create a jwToken for this user
  const payload = { sub: user._id };
  return jwt.sign(payload, process.env.JWT_SECRET);
}