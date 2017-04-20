const express = require('express');
const passport = require('passport');

// create an express router
const router = express.Router();

router.get('/spotify/callback', (req, res, next) => {
  // this is closure and i'm having trouble with it
  // we return the result of calling the function that is returned from passport.authenticate
  // in this way, the callback given to passport.authenticate has access to req, res, and next
  return passport.authenticate('spotify', (err, jwToken, user) => {
    if (err || !user) {
      // login failed, either due to error or no spotify auth
      res.redirect('/login');
    }

    // set cookie to JWT
    // TODO: upgrade the security of this?
    res.cookie('token', jwToken);

    // redirect response to /dashboard (will be caught by express and handed off to React-Router)
    res.redirect('/dashboard');
  })(req, res, next);
});

router.get('/spotify', 
  passport.authenticate('spotify', 
    {
      scope: [
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private'
      ],
    }
  )
);

module.exports = router;