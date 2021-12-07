import test from 'ava'
import { createBasicAuthenticationHandler } from './index.js'

test.beforeEach((t) => {

})

test('debug logout path throws 401', async (t) => {
  const basicAuthenticationHandler = createBasicAuthenticationHandler()
  const handler = basicAuthenticationHandler({
    url: 'http://example.com/basic-auth-logout'
  })
  const error = await t.throwsAsync(handler)
  t.is(error.status, 401)
  t.is(error.message, 'Logged out')
})

test('authenticate false passes through', async (t) => {
  const basicAuthenticationHandler = createBasicAuthenticationHandler({
    authenticate: false
  })
  const response = await basicAuthenticationHandler({
    url: 'http://example.com/'
  })
  t.is(response, undefined)
})

test('debug false throws error if not https', async (t) => {
  const basicAuthenticationHandler = createBasicAuthenticationHandler({
    debug: false
  })
  const handler = basicAuthenticationHandler({
    url: 'http://example.com/'
  })
  const error = await t.throwsAsync(handler)
  t.is(error.status, 400)
  t.is(error.message, 'Please use a HTTPS connection!')
})

test('valid authorization header but not verified throws 401', async (t) => {
  const basicAuthenticationHandler = createBasicAuthenticationHandler()
  const handler = basicAuthenticationHandler({
    url: 'http://example.com/',
    headers: {
      get: () => 'Basic YmFzaWNBdXRoOnRlc3Q='
    }
  })
  const error = await t.throwsAsync(handler)
  t.is(error.status, 401)
  t.is(error.message, 'Invalid credentials')
})

test('valid authorization header and verified passes through', async (t) => {
  const basicAuthenticationHandler = createBasicAuthenticationHandler({
    verifyCredentials: (user, pass) => true
  })
  const response = await basicAuthenticationHandler({
    url: 'http://example.com/',
    headers: {
      get: () => 'Basic YmFzaWNBdXRoOnRlc3Q='
    }
  })
  t.is(response, undefined)
})
