import { ThrowableRouter } from 'itty-router-extras'
import { createLoggableEventHandler } from './index.js'

const router = ThrowableRouter()
router.get('*', request => {
  request.log.info(logMessage)
  return new Response('Wrapped Handler')
})

const eventHandler = createLoggableEventHandler({ router, logOptions })

addEventListener('fetch', event => event.respondWith(eventHandler(event)))
