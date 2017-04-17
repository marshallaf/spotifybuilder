module.exports = {
  clientId: process.env.SPOTIFY_KEY,
  clientSecret: process.env.SPOTIFY_SECRET,
  callbackUrl: process.env.APP_URL + '/auth/spotify/callback',
}