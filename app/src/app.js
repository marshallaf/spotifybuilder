import React from 'react';
import ReactDOM from 'react-dom';

const AppUp = () => (
  <div>App is up!
  <a href="./auth/spotify">Login with Spotify?</a>
  </div>
);

ReactDOM.render(<AppUp />, document.getElementById('app'));
