import React from 'react';

class DashboardPage extends React.Component {
  constructor() {
    super();
  }

  userApi() {
    fetch('/api/user', { credentials: 'include' })
      .then(response => response.json())
      .then(json => console.log(json));
  }

  render() {
    return (
      <div>
        <h1>Dashboard Page</h1>
        <br />
        <span onClick={this.userApi}>Hit the user api</span>
      </div>
    );
  }
}

export default DashboardPage;