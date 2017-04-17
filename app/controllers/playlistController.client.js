(function() {
  const playlistDiv = document.querySelector('#playlists');
  const displayName = document.querySelector('#displayName');

  const userApi = window.location.origin + '/api/:id';

  fetchFunctions.ready(fetchFunctions.request('GET', userApi, user => {
    displayName.innerHTML = user.displayName;
    console.log(user);

    const playlistApi = `https://api.spotify.com/v1/users/${user.id}/playlists?limit=50`;
    fetchFunctions.spotifyRequest('GET', playlistApi, user.accessToken, playlists => {
      console.log(playlists);
      const playlistList = playlists.items.map(playlist => `<li>${playlist.name}</li>`);
      const fullPlaylistList = '<ul>' + playlistList.join('') + '</ul>';

      playlistDiv.innerHTML = fullPlaylistList;
    })
  }));

  
})();