const { sitesHandler } = require('./lib/sitesHandler')
const {
  basicAuthenticationHandler,
  createKVCredentialsVerifier
} = require('./lib/basicAuthenticationHandler')

module.exports = {
  sitesHandler,
  basicAuthenticationHandler,
  createKVCredentialsVerifier
}
