const path = require('path');
const express = require('express');
const routes = require('./app/routes/routes');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

// load environment variables
require('dotenv').load();

// start app
const app = express();
app.set('port', (process.env.PORT || 8080));

// setup passport config
require('./app/config/passport')(passport);

// connect to database
mongoose.connect(process.env.MONGO_URI);

// setup static access
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// setup session options
app.use(session({
  secret: 'portending crabs',
  resave: false,
  saveUninitialized: true,
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

app.listen(app.get('port'), () => console.log('listening on port ' + app.get('port') + '!'));
