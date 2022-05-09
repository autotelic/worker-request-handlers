import test from 'ava'
import sinon from 'sinon'
import { Miniflare } from 'miniflare'

test('send log event', async t => {
  const transport = sinon.spy()

  const mf = new Miniflare({
    scriptPath: './test/worker/dist/index.js',
    buildCommand: 'npm run build-test',
    globals: {
      createHandlerImportName: 'createLogTransportHandler',
      createHandlerArgs: [{ transport }],
    },
  })

  const logEvent = {
    level: 30,
    message: 'log message'
  }

  const res = await mf.dispatchFetch('http://localhost:8787/', {
    method: 'POST',
    body: JSON.stringify(logEvent)
  })
  t.true(transport.calledOnceWith(logEvent))
  t.is(res.status, 202)
  t.is(res.body, null)
})
