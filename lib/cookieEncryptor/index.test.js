import test from 'ava'
import { Miniflare } from 'miniflare'
import { ThrowableRouter } from 'itty-router-extras'
// import { createCookieEncryptor } from './index.js'

test.beforeEach(t => {
  const mf = new Miniflare({
    // script: `
    // addEventListener("fetch", (event) => {
    //   event.respondWith(new Response(greet("Miniflare")));
    // });
    // `,
    // bindings: {
    //   greet: (event) => `Hello ${name}!`,
    // },
    script: `
    const router = await routerSetup()
    addEventListener('fetch', event => {
      event.respondWith(new Response('ok'))
    });
    `,
    bindings: {
      routerSetup: async () => {
        const { createCookieEncryptor } = await import('./index.js')

        const { decrypt, encrypt, extractToken, decryptionHandler } = createCookieEncryptor({
          cookieName: 'cookieName',
          encryptionKey: 'm1wGHPBiT3psGFbuT6tPYbnQ5cC7HdhcgRzwit551io'
        })

        const router = ThrowableRouter()

        router.all('*', request => new Response('ok'))

        return router
      },
    },
  })
  t.context = { mf }
  // const keyObj = await crypto.subtle.generateKey(
  //   {
  //     name: "AES-GCM",
  //     length: 256
  //   },
  //   true,
  //   ["encrypt", "decrypt"]
  // )
  // const rawKey = await crypto.subtle.exportKey('raw', keyObj)
  // const strKey = String.fromCharCode.apply(null, new Uint16Array(rawKey)
  // console.log(strKey)
  // t.context = { config }
})

test('smoke', async t => {
  const { mf } = t.context
  const res = await mf.dispatchFetch('http://localhost:8787')
  const text = await res.text()
  console.log(text)
  t.pass()
})
