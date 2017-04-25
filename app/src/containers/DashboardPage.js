import React from 'react';
import axios from 'axios';
import PlaylistCtr from './PlaylistCtr';
import UserInfo from '../components/UserInfo';

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

    this.changePlaylistRole = this.changePlaylistRole.bind(this);
    this.savePlaylists = this.savePlaylists.bind(this);
    this.aggregate = this.aggregate.bind(this);
  }

  componentWillMount() {
    // get user information
    axios.get('/api/user', { withCredentials: true })
    .then(response => {
      this.setState({
        displayName: response.data.spotify.displayName,
        imageUrl: response.data.spotify.image,
      });
    })
    .catch(err => {
      if (err.response.data.error) console.error(err.response.data.error);
      else console.error('error fetching user data');
    });

    // get playlists and current bundle roles
    axios.get('/api/playlists', { withCredentials: true })
    .then(response => {
      const barnIndex = response.data.findIndex(playlist => playlist.role == 'barn');
      this.setState({ playlists: response.data, barnIndex: barnIndex })
    });
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

  aggregate() {
    axios.post('/api/aggregate', { withCredentials: true, data: {playlists: this.state.playlists}});
  }

  render() {
    return (
      <div className='container'>
        <UserInfo
          displayName={this.state.displayName}
          imageUrl={this.state.imageUrl}
          save={this.savePlaylists}
          bundle={this.aggregate}
        />
        {this.state.playlists.length !== 0 && 
          <div className='playlists-container'>
            {this.state.playlists.map((playlist, index) => (
              <PlaylistCtr
                key={index}
                name={playlist.name}
                role={playlist.role}
                owned={playlist.owned}
                pos={index}
                barn={index == this.state.barnIndex}
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