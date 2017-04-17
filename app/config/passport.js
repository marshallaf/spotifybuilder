const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('../models/users');
const AuthConfig = require('./auth');

module.exports = passport => {

  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(new SpotifyStrategy(
    {
      clientID: AuthConfig.clientId,
      clientSecret: AuthConfig.clientSecret,
      callbackURL: AuthConfig.callbackUrl,
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => {
        User.findOne({ 'spotify.id': profile.id }, (err, user) => {
          if (err) return done(err);
          if (user) return done(null, user);
          else {
            const newUser = new User();
            console.log(profile._json);
            newUser.spotify.id = profile._json.id;
            newUser.spotify.displayName = profile._json.display_name;
            newUser.spotify.href = profile._json.href;
            newUser.spotify.image = profile._json.images[0].url;

            newUser.save(err => {
              if (err) throw err;
              return done(null, newUser);
            });
          }
        });
      });
    }
  ));
};