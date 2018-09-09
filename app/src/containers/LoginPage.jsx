import React from 'react';

class LoginPage extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <h1>Login Page</h1>
        <br />
        <a href='/auth/spotify'>Login with Spotify</a>
      </div>
    );
  }
}

export default LoginPage;
