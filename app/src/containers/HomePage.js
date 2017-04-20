import React from 'react';
import { Link } from 'react-router-dom';

class HomePage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Home Page</h1>
        <br />
        <Link to='/login'>Login</Link>
      </div>
    );
  }
}

export default HomePage;