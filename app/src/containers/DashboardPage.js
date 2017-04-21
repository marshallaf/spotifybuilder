import React from 'react';
import axios from 'axios';
import PlaylistBox from './PlaylistBox';

class DashboardPage extends React.Component {
  constructor() {
    super();

    this.state = {
      displayName: '',
      imageUrl: '',
      playlists: [],
    };

    this.userApi = this.userApi.bind(this);
    this.playlistApi = this.playlistApi.bind(this);
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
      .then(response => this.setState({ playlists: response.data }));
  }

  changePlaylistRole(e) {
    console.log(e.target);
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
        <br />
        {this.state.playlists.length !== 0 &&
          <div>
            {this.state.playlists.map(playlist => (
              <PlaylistBox
                name={playlist.name}
                role={playlist.role}
                changeRole={this.changePlaylistRole} 
              />
            ))}
          </div>
        }
      </div>
    );
  }
}

export default DashboardPage;