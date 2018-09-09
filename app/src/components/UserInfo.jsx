import React from 'react';
import PropTypes from 'prop-types';

const UserInfo = ({
  displayName,
  imageUrl,
  save,
  bundle
}) => (
  <div className='info-container'>
    <div className='profile-pic'>
      <img src={imageUrl} alt={`${displayName}'s Spotify profile`} />
    </div>
    <h2>{displayName}</h2>
    <div className='button-container'>
      <button type='button' className='save' onClick={save}>Save</button>
      <button type='button' className='bundle' onClick={bundle}>Bundle!</button>
    </div>
  </div>
);

UserInfo.propTypes = {
  displayName: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  save: PropTypes.func.isRequired,
  bundle: PropTypes.func.isRequired
};

export default UserInfo;