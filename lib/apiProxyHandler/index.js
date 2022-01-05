/* global Headers, Request, fetch */

export const createApiProxyHandler = ({ DOWNSTREAM_HOST, extractToken = request => null }) => {
  return async (request, event, config) => {
    const {
      body,
      headers,
      method,
      redirect,
      url
    } = request

    try {
      const proxyURL = new URL(url)
      const downstreamUrl = new URL(DOWNSTREAM_HOST)
      proxyURL.pathname = proxyURL.pathname.replace(/^\/api/, '')
      proxyURL.host = downstreamUrl.host
      proxyURL.port = downstreamUrl.port
      proxyURL.protocol = downstreamUrl.protocol

      const proxyHeaders = new Headers(headers)

      const decryptedToken = extractToken(request)

      // remove existing authorization headers
      // TODO(eadmundo): maybe this should be a configurable authHeaderHandler method
      proxyHeaders.delete('Authorization')

      // replace with our token header if we have one
      if (decryptedToken) {
        proxyHeaders.append('Authorization', `Bearer ${decryptedToken}`)
      }
      const modifiedRequest = new Request(proxyURL.toString(), {
        body,
        headers: proxyHeaders,
        method,
        redirect
      })

      return fetch(modifiedRequest)
    } catch (err) {
      throw new Error('Error proxying to the API', { cause: err })
    }
  }
}
