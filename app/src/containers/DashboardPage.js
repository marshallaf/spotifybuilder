import React from 'react';

class DashboardPage extends React.Component {
  constructor() {
    super();

    this.state = {
      displayName: '',
      imageUrl: '',
    };

    this.userApi = this.userApi.bind(this);
  }

  userApi() {
    fetch('/api/user', { credentials: 'include' })
      .then(response => {
        if (response.status === 200) {
          response.json()
            .then(user => {
              this.setState({
                displayName: user.spotify.displayName,
                imageUrl: user.spotify.image,
              });
            });
        }
      });
  }

  render() {
    return (
      <div>
        <h1>Dashboard Page</h1>
        <br />
        <span onClick={this.userApi}>Hit the user api</span>
        <br />
        {this.state.displayName && 
          <div>
            <h2>Hello, {this.state.displayName}!</h2>
            <img src={this.state.imageUrl} />
          </div>
        }
      </div>
    );
  }
}

export default DashboardPage;