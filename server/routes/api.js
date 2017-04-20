const express = require('express');
const cookieParser = require('cookie-parser');

const router = express.Router();
router.use(cookieParser());

// route to /api/user
router.get('/user', (req, res) => {
  if (req.cookies && req.cookies.token) {
    res.json({
      token: req.cookies.token,
    });
  } else {
    res.json({
      token: null,
    });
  }
});

module.exports = router;