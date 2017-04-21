import React from 'react';
import axios from 'axios';

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

  playlistApi() {
    axios.get('/api/playlists', { withCredentials: true })
      .then(response => console.log(response.data));
  }

  render() {
    return (
      <div>
        <h1>Dashboard Page</h1>
        <br />
        <span onClick={this.userApi}>Hit the user api</span>
        <br />
        <span onClick={this.playlistApi}>Hit the playlist api</span>
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