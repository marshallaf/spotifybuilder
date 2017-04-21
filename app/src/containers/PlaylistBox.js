import React from 'react';

const PlaylistBox = ({
  name,
  role,
  changeRole,
}) => (
  <div className='playlist' onClick={changeRole}>
    <div>{name}</div>
    {role !== 'none' && 
      <div>{role}</div>
    }
  </div>
);

export default PlaylistBox;