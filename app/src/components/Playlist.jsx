import React from 'react';
import PropTypes from 'prop-types';

const Playlist = ({
  name,
  role,
  owned,
  handleBarn,
  handleSheep
}) => (
  <div className={`playlist ${role}`}>
    <button
      type='button'
      className={`bundle ${role === 'barn' ? 'highlight' : ''} 
                  ${role === 'sheep' ? 'faded' : ''} 
                  ${owned ? '' : 'inactive'}`
                }
      onClick={handleBarn}
      title={owned ? 'Click to select this playlist as the bundle.' : 'This playlist cannot be the bundle because it is owned by another Spotify user.'}
    >
      Bundle
    </button>
    <button
      type='button'
      className={`add-list ${role === 'sheep' ? 'highlight' : ''}
                 ${role === 'barn' ? 'faded' : ''}`
                }
      onClick={handleSheep}
    >
      Add
    </button>
    <div className='playlist-name'>{name}</div>
  </div>
);

Playlist.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  owned: PropTypes.bool.isRequired,
  handleBarn: PropTypes.func.isRequired,
  handleSheep: PropTypes.func.isRequired
};

export default Playlist;
