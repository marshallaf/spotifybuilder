import React from 'react';

const Playlist = ({
  name,
  role,
  handleBarn,
  handleSheep
}) => (
  <div className={`playlist ${role}`}>
    <button className={`bundle ${role=='barn' ? 'highlight' : ''} ${role=='sheep' ? 'faded' : ''}`} onClick={handleBarn}>Bundle</button>
    <button className={`add-list ${role=='sheep' ? 'highlight' : ''} ${role=='barn' ? 'faded' : ''}`} onClick={handleSheep}>Add</button>
    <div className='playlist-name'>{name}</div>
  </div>
);

export default Playlist;