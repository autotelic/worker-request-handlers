import test from 'ava'
import { Miniflare } from 'miniflare'
// import { createCookieEncryptor } from './index.js'

test.beforeEach(t => {
  const mf = new Miniflare({
    script: `
    addEventListener('fetch', handler);
    `,
    bindings: {
      handler: async event => {
        const { createCookieEncryptor } = await import('./index.js')
        event.respondWith(new Response('ok'))
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
