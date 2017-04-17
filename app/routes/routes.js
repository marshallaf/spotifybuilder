const path = require('path');

const routes = (app, passport) => {

  // redirect to login if not logged in
  function isAuthed(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  }

  app.route('/')
    .get(isAuthed, (req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
    });

  app.route('/login')
    .get((req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'login.html'));
    });

  app.route('/logout')
    .get((req, res) => {
      // passport-included logout function
      // removes the req.user property and clears any sessions
      req.logout();
      res.redirect('/login');
    });

  app.route('/profile')
    .get(isAuthed, (req, res) => {
      res.sendFile(process.cwd() + '/public/profile.html');
    });

  // returns json object with user information from passport
  app.route('/api/:id')
    .get(isAuthed, (req, res) => {
      res.json(req.user.spotify);
    });

  // calls passport to authenticate using spotify
  app.route('/auth/spotify')
    .get(passport.authenticate('spotify', 
      {
        scope: [
          'playlist-read-private',
          'playlist-modify-public',
          'playlist-modify-private'
        ],
      }
    ));

  app.route('/auth/spotify/callback')
    .get(passport.authenticate('spotify', {
      successRedirect: '/profile',
      failureRedirect: '/login',
    }));
}

module.exports = routes;