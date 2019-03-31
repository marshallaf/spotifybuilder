import React from 'react';
import PropTypes from 'prop-types';

class AddToFilter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      artistId: '',
      artistName: ''
    };

    this.handleIdChange = this.handleIdChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSubmitFilter = this.handleSubmitFilter.bind(this);
  }

  handleIdChange(event) {
    this.setState({ artistId: event.target.value });
  }

  handleNameChange(event) {
    this.setState({ artistName: event.target.value });
  }

  handleSubmitFilter() {
    const { filterAddAction } = this.props;
    const { artistId, artistName } = this.state;
    filterAddAction({
      id: artistId,
      name: artistName
    });
    this.setState({
      artistId: '',
      artistName: ''
    });
  }

  render() {
    const { artistId, artistName } = this.state;
    return (
      <div className='info-container'>
        <input type='text' onChange={this.handleNameChange} value={artistName} placeholder='artist name' />
        <input type='text' onChange={this.handleIdChange} value={artistId} placeholder="artist's Spotify id" />
        <button type='button' onClick={this.handleSubmitFilter}>Add to filtered artists</button>
      </div>
    );
  }
}

AddToFilter.propTypes = {
  filterAddAction: PropTypes.func.isRequired
};

export default AddToFilter;
