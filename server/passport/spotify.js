const SpotifyStrategy = require('passport-spotify').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/users');

module.exports = new SpotifyStrategy(
  {
    clientID: process.env.SPOTIFY_KEY,
    clientSecret: process.env.SPOTIFY_SECRET,
    callbackURL: `${process.env.APP_URL}/auth/spotify/callback`,
    session: false,
  },
  (accessToken, refreshToken, response, done) => {
    // makes it async
    process.nextTick(() => {
      const profile = response._json;
      User.findOneAndUpdate(
        { spotifyId: profile.id },
        {
          $setOnInsert: { spotifyId: profile.id },
          displayName: profile.display_name,
          href: profile.href,
          image: profile.images[0].url,
          accessToken,
          refreshToken
        },
        {
          new: true,
          upsert: true
        }
      )
        .then(user => {
          console.log('User found or created, creating session.');
          const token = createJWT(user);

          // return to routing (/auth/login)
          done(null, token, user);
        })
        .catch(findErr => done(findErr));
    });
  }
);

function createJWT(user) {
  // create a jwToken for this user
  const payload = { sub: user.spotifyId };
  return jwt.sign(payload, process.env.JWT_SECRET);
}
