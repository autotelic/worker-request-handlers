import test from 'ava'
import { Miniflare } from 'miniflare'
import { createCookieEncryptor } from './index.js'

test.beforeEach((t) => {
  const mf = new Miniflare({
    scriptPath: './lib/cookieEncryptor/worker.js'
  })

  // const { decrypt, encrypt, extractToken, decryptionHandler } = createCookieEncryptor({
  //   cookieName: 'cookieName',
  //   encryptionKey: 'm1wGHPBiT3psGFbuT6tPYbnQ5cC7HdhcgRzwit551io'
  // })

  t.context = { mf }
})

test("just give it a go", async (t) => {
  const { mf } = t.context
  t.pass()
  const res = await mf.dispatchFetch("http://localhost:8787/");
  // t.is(await res.text(), "ok");
})
