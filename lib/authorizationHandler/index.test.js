import test from 'ava'
import { createAuthorizationHandler } from './index.js'

test.beforeEach((t) => {
  const rules = `allow_request(_user, request) if
  request.user == "test1";
`
  const authorizationHandler = createAuthorizationHandler(
    request => request.user,
    request => request,
    async oso => {
      await oso.loadStr(rules)
    }
  )

  t.context = { authorizationHandler }
})

test('request allowed', async ({ notThrowsAsync, context }) => {
  const { authorizationHandler } = context
  await notThrowsAsync(authorizationHandler({ user: 'test1' }))
})

test('request not allowed', async ({ throwsAsync, context }) => {
  const { authorizationHandler } = context
  await throwsAsync(authorizationHandler({ user: 'test2' }))
})
