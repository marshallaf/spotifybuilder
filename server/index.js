const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');

// load environment variables
require('dotenv').load();

// connect to database
mongoose.connect(process.env.MONGO_URI);

// initialize express
const app = express();
app.set('port', (process.env.PORT || 8080));

// enable parsing of http body
app.use(bodyParser.urlencoded({extended: false}));

// set location of static files to serve
// html and css
app.use(express.static(path.join(__dirname, '../app/static')));
// the bundled javascript
app.use(express.static(path.join(__dirname, '../app/build')));

// initialize passport and strategy
app.use(passport.initialize());
passport.use('spotify', require('./passport/spotify'));

// server routing
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// ensure all routes typed into the address bar are routed to React-Router (at the entry)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../app/static/index.html'));
});

// start the server
app.listen(app.get('port'), () => {
  console.log('server listening on port ' + app.get('port'));
});