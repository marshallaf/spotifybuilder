const jwt = require('jsonwebtoken');
const User = require('../models/users');

// express middleware for authenticating users
// verifies jwt and decodes the payload (user id)
// sends on to next middleware
module.exports = (req, res, next) => {
  if (!req.cookies || !req.cookies.token) {
    // there was no cookie
    console.log('there was no cookie');
    return res.status(401).end();
  }

  return jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('error during verification');
      return res.status(401).end();
    }

    const userId = decoded.sub;

    // check that the user exists
    return User.findById(userId, (findErr, user) => {
      if (findErr || !user) {
        console.log('error locating user');
        return res.status(401).end();
      }
      
      console.log(user);
      req.user = user;
      return next();
    });
  });
};