import React from 'react';
import axios from 'axios';
import PlaylistCtr from './PlaylistCtr';

class DashboardPage extends React.Component {
  constructor() {
    super();

    this.state = {
      displayName: '',
      imageUrl: '',
      playlists: [],
      barnIndex: -1,
      saveSuccess: false,
    };

    this.userApi = this.userApi.bind(this);
    this.playlistApi = this.playlistApi.bind(this);
    this.changePlaylistRole = this.changePlaylistRole.bind(this);
    this.savePlaylists = this.savePlaylists.bind(this);
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

  changePlaylistRole(position, newRole) {
    let newPlaylists = [...this.state.playlists];
    newPlaylists[position].role = newRole;

    let barnIndex = this.state.barnIndex;
    if (newRole == 'barn') {
      barnIndex = position;
      if (this.state.barnIndex != -1) newPlaylists[this.state.barnIndex].role = 'none';
    } else if (this.state.barnIndex == position) barnIndex = -1;

    this.setState({
      playlists: newPlaylists,
      barnIndex: barnIndex,
    });
  }

  savePlaylists() {
    axios.post('/api/playlists', { withCredentials: true, data: {playlists: this.state.playlists}});
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
            <div>
              {this.state.playlists.map((playlist, index) => (
                <PlaylistCtr
                  name={playlist.name}
                  role={playlist.role}
                  pos={index}
                  barn={index == this.state.barnIndex}
                  changeRole={this.changePlaylistRole} 
                />
              ))}
            </div>
            <button onClick={this.savePlaylists}>Save playlists</button>
          </div>
        }
      </div>
    );
  }
}

export default DashboardPage;