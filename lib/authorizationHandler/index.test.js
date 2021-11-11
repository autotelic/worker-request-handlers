import test from 'ava'
import { createAuthorizationHandler } from './index.js'
import { Miniflare } from 'miniflare'

// ;(async () => {
//   const mf = new Miniflare({})
//   const newcoBasicAuthNS = await mf.getKVNamespace("NEWCO_BASIC_AUTH")
//   await newcoBasicAuthNS.put("USER", "skipper")
//   await newcoBasicAuthNS.put("PASS", "otto")
//   mf.createServer().listen(5000, () => {
//     console.log("Listening on :5000");
//   })
// })()

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

  const mf = new Miniflare({
    scriptPath: './lib/authorizationHandler/testWorker.js'
  })

  t.context = { authorizationHandler, mf }
})

test("just give it a go", async (t) => {
  // Get the Miniflare instance
  const { mf } = t.context;
  // Dispatch a fetch event to our worker
  const res = await mf.dispatchFetch("http://localhost:8787/");
  // Check the count is "1" as this is the first time we've been to this path
  t.is(await res.text(), "authorization");
})

test('request allowed', async ({ notThrowsAsync, context }) => {
  const { authorizationHandler } = context
  await notThrowsAsync(authorizationHandler({ user: 'test1' }))
})

test('request not allowed', async ({ throwsAsync, context }) => {
  const { authorizationHandler } = context
  await throwsAsync(authorizationHandler({ user: 'test2' }))
})
