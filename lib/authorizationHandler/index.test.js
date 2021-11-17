import test from 'ava'
import sinon from 'sinon'
import { createAuthorizationHandler } from './index.js'

test.beforeEach((t) => {
  const rules = `allow_request(_user, request) if
  request.user == "test1";
`
  const config = {
    getUser: request => request.user,
    getRequest: request => request,
    setupOso: async oso => {
      await oso.loadStr(rules)
    }
  }

  t.context = { config }
})

test('request allowed', async ({ notThrowsAsync, context, assert }) => {
  const { config } = context
  const authorizationHandler = createAuthorizationHandler(config)
  let request = {
    user: 'test1'
  }
  await notThrowsAsync(authorizationHandler(request))
  assert(request.authorized)
})

test('already authorized', async t => {
  const getUser = sinon.spy()
  const getRequest = sinon.spy()
  const setupOso = sinon.spy()
  const authorizationHandler = createAuthorizationHandler({
    getAuthorizationCookie: request => true,
    getUser,
    getRequest,
    setupOso
  })
  let request = {}
  await t.notThrowsAsync(authorizationHandler(request))
  t.true(getUser.notCalled)
  t.true(getRequest.notCalled)
  t.true(setupOso.notCalled)
  t.true(request.authorized)
})

test('request not allowed, throw errors', async ({ throwsAsync, context }) => {
  const { config } = context
  const authorizationHandler = createAuthorizationHandler(config)
  await throwsAsync(authorizationHandler({ user: 'test2' }))
})

test('request not allowed, does not throw errors', async t => {
  const { notThrowsAsync, context } = t
  const { config } = context
  const authorizationHandler = createAuthorizationHandler({
    ...config,
    throwErrors: false
  })
  let request = {
    user: 'test2'
  }
  await notThrowsAsync(authorizationHandler(request))
  t.false(request.authorized)
})
