const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// initialize express
const app = express();
app.set('port', (process.env.PORT || 8080));

// enable parsing of http body
app.use(bodyParser.urlencoded({extended: false}));

console.log(path.join(__dirname, '../app/static'));
// set location of static files to serve
// html and css
app.use(express.static(path.join(__dirname, '../app/static')));
// the bundled javascript
app.use(express.static(path.join(__dirname, '../app/build')));

// start the server
app.listen(app.get('port'), () => {
  console.log('server listening on port ' + app.get('port'));
});