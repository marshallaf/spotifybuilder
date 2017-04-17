
const fetchFunctions = {
  ready: (fn) => {
    if (typeof fn !== 'function') {
      return;
    }

    if (document.readyState === 'complete') {
      return fn();
    }

    document.addEventListener('DOMContentLoaded', fn);
  },
  request: (method, url, callback) => {
    // to keep authentication cookies with the request
    // credentials must be set to include
    const fetchOptions = {
      method: method,
      credentials: 'include',
    };

    fetch(url, fetchOptions)
      .then(response => {
        // on response, verify OK status and turn to json
        if (response.status === 200) {
          return response.json();
        }
      }).catch(error => { throw error; })
      // call callback with the json
      .then(bodyJson => {
        callback(bodyJson);
      });
  },
  spotifyRequest: (method, url, accessToken, callback) => {
    const headers = new Headers({
      'Authorization': 'Bearer ' + accessToken,
    });

    const fetchOptions = {
      method: method,
      headers: headers,
    };

    fetch(url, fetchOptions)
      .then(response => response.json())
      .catch(error => { throw error; })
      .then(bodyJson => callback(bodyJson));
  }
};