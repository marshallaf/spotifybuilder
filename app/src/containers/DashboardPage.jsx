import React from 'react';
import axios from 'axios';
import PlaylistContainer from './PlaylistContainer';
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
          displayName: response.data.displayName,
          imageUrl: response.data.image,
        });
      })
      .catch(err => {
        console.error('error fetching user data');
        console.error(err);
      });

    // get playlists and current bundle roles
    axios.get('/api/playlists', { withCredentials: true })
      .then(response => {
        const barnIndex = response.data.findIndex(playlist => playlist.role === 'barn');
        this.setState({ playlists: response.data, barnIndex });
      });
  }

  changePlaylistRole(position, newRole) {
    const { prevBarnIndex, playlists } = this.state;
    const newPlaylists = [...playlists];
    newPlaylists[position].role = newRole;

    let barnIndex = prevBarnIndex;
    if (newRole === 'barn') {
      barnIndex = position;
      if (prevBarnIndex !== -1) newPlaylists[prevBarnIndex].role = 'none';
    } else if (prevBarnIndex === position) barnIndex = -1;

    this.setState({
      playlists: newPlaylists,
      barnIndex,
    });
  }

  savePlaylists() {
    const { playlists } = this.state;
    axios.post('/api/playlists', { withCredentials: true, data: { playlists } });
  }

  aggregate() {
    const { playlists } = this.state;
    axios.post('/api/aggregate', { withCredentials: true, data: { playlists } });
  }

  render() {
    const {
      displayName, imageUrl, playlists, barnIndex
    } = this.state;
    return (
      <div className='container'>
        <UserInfo
          displayName={displayName}
          imageUrl={imageUrl}
          save={this.savePlaylists}
          bundle={this.aggregate}
        />
        {playlists.length !== 0 && (
          <div className='playlists-container'>
            {playlists.map((playlist, index) => (
              <PlaylistContainer
                key={playlist.name}
                name={playlist.name}
                role={playlist.role}
                owned={playlist.owned}
                position={index}
                barn={index === barnIndex}
                changeRole={this.changePlaylistRole}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default DashboardPage;