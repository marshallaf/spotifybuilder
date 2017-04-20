const express = require('express');
const passport = require('passport');

// create an express router
const router = express.Router();

router.post('/login', (req, res, next) => {
  // this is closure and i'm having trouble with it
  // we return the result of calling the function that is returned from passport.authenticate
  // in this way, the callback given to passport.authenticate has access to req, res, and next
  return passport.authenticate('spotify', (err, jwToken, user) => {
    if (err) {
      // spotify login failed
      return res.status(400).json({
        success: false,
      });
    }
    // return token and user data to requester
    return res.status(200).json({
      success: true,
      jwToken,
      user,
    });
  })(req, res, next);
});

module.exports = router;