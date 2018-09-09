import React from 'react';
import PropTypes from 'prop-types';
import Playlist from '../components/Playlist';

class PlaylistContainer extends React.Component {
  constructor(props) {
    super(props);

    this.handleBarn = this.handleBarn.bind(this);
    this.handleSheep = this.handleSheep.bind(this);
  }

  handleBarn() {
    const {
      owned, barn, pos, changeRole
    } = this.props;
    if (!owned) return;
    const newRole = (barn) ? 'none' : 'barn';
    changeRole(pos, newRole);
  }

  handleSheep() {
    const { role, changeRole, pos } = this.props;
    const newRole = role === 'sheep' ? 'none' : 'sheep';
    changeRole(pos, newRole);
  }

  render() {
    const { name, role, owned } = this.props;
    return (
      <Playlist
        handleBarn={this.handleBarn}
        handleSheep={this.handleSheep}
        name={name}
        role={role}
        owned={owned}
      />
    );
  }
}

PlaylistContainer.propTypes = {
  barn: PropTypes.bool.isRequired,
  owned: PropTypes.bool.isRequired,
  pos: PropTypes.number.isRequired,
  changeRole: PropTypes.func.isRequired,
  role: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default PlaylistContainer;
