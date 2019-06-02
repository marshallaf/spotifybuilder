import React from 'react';
import axios from 'axios';
import PlaylistContainer from './PlaylistContainer';
import UserInfo from '../components/UserInfo';
import AddToFilter from '../components/AddToFilter'

class DashboardPage extends React.Component {
  static addToFilter(artistToAdd) {
    axios.post('/api/filterArtist', { withCredentials: true, data: { artistToAdd } });
  }

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
    const { barnIndex, playlists } = this.state;
    const newPlaylists = [...playlists];
    newPlaylists[position].role = newRole;

    let newBarnIndex;
    if (newRole === 'barn') {
      newBarnIndex = position;
      if (barnIndex !== -1) {
        newPlaylists[barnIndex].role = 'none';
      }
    } else if (newRole === 'none' && position === barnIndex) {
      newBarnIndex = -1;
    } else {
      newBarnIndex = barnIndex;
    }

    this.setState({
      playlists: newPlaylists,
      barnIndex: newBarnIndex
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
        <div className='sidebar'>
          <UserInfo
            displayName={displayName}
            imageUrl={imageUrl}
            save={this.savePlaylists}
            bundle={this.aggregate}
          />
          <AddToFilter
            filterAddAction={DashboardPage.addToFilter}
          />
        </div>
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
