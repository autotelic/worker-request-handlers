/* global DOWNSTREAM_HOST */

import { RequestCookieStore } from '@worker-tools/request-cookie-store'

export const createApiProxyHandler = DOWNSTREAM_HOST => {
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

      const cookieStore = new RequestCookieStore(request)
      // Cookie must be decrypted here
      const { value: decryptedToken } = await cookieStore.get('token')
      // Cookie must be decrypted here

      proxyHeaders.delete('cookie')
      proxyHeaders.append('Bearer', decryptedToken)

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
