import React from 'react';

const Playlist = ({
  name,
  role,
  handleBarn,
  handleSheep
}) => (
  <div className='playlist'>
    <button onClick={handleBarn}>Barn!</button>
    <button onClick={handleSheep}>Sheep!</button>
    <div className={`role ${role}`}>
    {role !== 'none' && 
      role
    }
    </div>
    <div>{name}</div>
  </div>
);

export default Playlist;