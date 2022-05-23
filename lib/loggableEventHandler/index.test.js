import test from 'ava'
import sinon from 'sinon'
import { Miniflare } from 'miniflare'

test.beforeEach(async t => {
  const clock = sinon.useFakeTimers({
    now: 1653346950160
  })
  t.context = { clock }
})

test.afterEach(async t => {
  const { context } = t
  const { clock } = context
  clock.restore()
})

test('log.info and log.report called for request', async t => {
  const reporter = sinon.spy()
  const outFile = './util/worker/dist/loggableEventHandler.js'

  const mf = new Miniflare({
    scriptPath: outFile,
    buildCommand: `npm run build-test -- --outfile=${outFile} out=./lib/loggableEventHandler/workerRunner.js`,
    globals: {
      logMessage: 'log message',
      logOptions: { reporter },
    },
  })

  const res = await mf.dispatchFetch('http://localhost:8787/', {})
  const text = await res.text()
  t.is(text, 'Wrapped Handler')
  t.true(reporter.calledOnceWith([
    {
      '@t': '2022-05-23T23:02:30.160Z',
      '@m': 'log message',
      '@l': 'INFO'
    }
  ]))
})
