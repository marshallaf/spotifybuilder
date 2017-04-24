import React from 'react';

const UserInfo = ({
  displayName,
  imageUrl,
  save,
  bundle
}) => (
  <div className='info-container'>
    <img src={imageUrl} />
    <h2>{displayName}'s bundle</h2>
    <div className='button-container'>
      <button className='save' onClick={save}>Save</button>
      <button className='bundle' onClick={bundle}>Bundle!</button>
    </div>
  </div>
);

export default UserInfo;