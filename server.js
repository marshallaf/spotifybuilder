const express = require('express');
const routes = require('./app/routes/routes');

const app = express();

app.set('port', (process.env.PORT || 8080));

routes(app);

app.listen(app.get('port'), () => console.log('listening on port ' + app.get('port') + '!'));
