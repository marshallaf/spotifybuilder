

(function() {
  const apiUrl = window.location.origin + '/api/:id';
  // get DOM elements
  const profileId = document.querySelector('#profile-id');
  const displayName = document.querySelector('#display-name');
  const profilePic = document.querySelector('#profile-pic')

  fetchFunctions.ready(fetchFunctions.request('GET', apiUrl, data => {
    profileId.innerHTML = data.id;
    displayName.innerHTML = data.displayName;
    profilePic.src = data.image;
  }))
})();