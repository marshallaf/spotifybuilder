const jwt = require('jsonwebtoken');
const User = require('../models/users');

// express middleware for authenticating users
// verifies jwt and decodes the payload (user id)
// sends on to next middleware
module.exports = (req, res, next) => {
  if (!req.cookies || !req.cookies.token) {
    // there was no cookie
    return res.status(401).json({ error: 'Session creation failed.' });
  }

  return jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Error verifying user's session token." });
    }

    const userId = decoded.sub;

    // check that the user exists
    return User.findOne({ spotifyId: userId }, (findErr, user) => {
      if (findErr || !user) {
        return res.status(401).json({ error: 'User not found in database.' });
      }

      req.user = user;
      return next();
    });
  });
};
