import test from 'ava'
import { createLoggableEventHandler } from './index.js'

test('createLoggableEventHandler', async t => {
  const eventHandler = createLoggableEventHandler({})
  t.pass()
})
