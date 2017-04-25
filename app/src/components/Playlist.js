import React from 'react';

const Playlist = ({
  name,
  role,
  owned,
  handleBarn,
  handleSheep
}) => (
  <div className={`playlist ${role}`}>
    <button 
      className={`bundle ${role=='barn' ? 'highlight' : ''} 
                  ${role=='sheep' ? 'faded' : ''} 
                  ${owned ? '' : 'inactive'}`} 
      onClick={handleBarn}
      title={owned ? 'Click to select this playlist as the bundle.' : 'This playlist cannot be the bundle because it is owned by another Spotify user.'}
    >Bundle</button>
    <button className={`add-list ${role=='sheep' ? 'highlight' : ''} ${role=='barn' ? 'faded' : ''}`} onClick={handleSheep}>Add</button>
    <div className='playlist-name'>{name}</div>
  </div>
);

export default Playlist;