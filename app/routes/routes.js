const path = require('path');

const routes = app => {
  app.route('/')
    .get((req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
    });
}

module.exports = routes;