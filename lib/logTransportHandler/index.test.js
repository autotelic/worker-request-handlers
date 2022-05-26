import test from 'ava'
import sinon from 'sinon'
import { Miniflare } from 'miniflare'

test('send log event', async t => {
  const transport = sinon.spy()
  const outFile = './util/worker/dist/logTransportHandler.js'

  const mf = new Miniflare({
    scriptPath: outFile,
    buildCommand: `npm run build-test -- --outfile=${outFile} out=./lib/logTransportHandler/workerRunner.js`,
    globals: {
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
