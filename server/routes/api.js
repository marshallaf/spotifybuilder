const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const router = express.Router();
router.use(cookieParser());

// route to /api/user
router.get('/user', (req, res) => {
  if (!req.user) {
    console.log('there is no user');
    return res.status(401).end();
  }

  return res.status(200).json(req.user);
});

module.exports = router;