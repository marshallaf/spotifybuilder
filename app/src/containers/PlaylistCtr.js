import React from 'react';
import Playlist from '../components/Playlist';

class PlaylistCtr extends React.Component {
  constructor(props) {
    super(props);

    this.handleBarn = this.handleBarn.bind(this);
    this.handleSheep = this.handleSheep.bind(this);
  }

  handleBarn() {
    if (!this.props.owned) return;
    let newRole = '';
    if (this.props.barn) newRole = 'none';
    else newRole = 'barn';
    this.props.changeRole(this.props.pos, newRole);
  }

  handleSheep() {
    let newRole = '';
    if (this.props.role == 'sheep') newRole = 'none';
    else newRole = 'sheep';
    this.props.changeRole(this.props.pos, newRole);
  }

  render() {
    return (
      <Playlist
        handleBarn={this.handleBarn}
        handleSheep={this.handleSheep}
        name={this.props.name}
        role={this.props.role}
        owned={this.props.owned}
      />
    );
  }
}

export default PlaylistCtr;