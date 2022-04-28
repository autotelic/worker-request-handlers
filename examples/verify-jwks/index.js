import { ThrowableRouter } from 'itty-router-extras'
import { createLocalJWKSet, createRemoteJWKSet } from 'jose'
import { createVerifyJwksHandler } from '../../lib/verifyJwksHandler'

const getJwks = async request => {
  return createLocalJWKSet({
    keys: [
      // insert public jwk here
    ]
  })
}

const verifyJWKsHandler = createVerifyJwksHandler({
  getJwks,
  onVerified: (request, verificationResult) => {
    console.log(verificationResult)
  }
})

const router = ThrowableRouter()

router
  .all('*', verifyJWKsHandler, request => {
    return new Response('hello world')
  })

addEventListener('fetch', event => {
  const request = new Request(event.request)
  event.respondWith(router.handle(request))
})
