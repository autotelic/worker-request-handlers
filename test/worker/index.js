import { ThrowableRouter } from 'itty-router-extras'
// import { createLogTransportHandler } from '../../lib/logTransportHandler/index.js'

addEventListener('fetch', event => {
  const { request } = event
  // event.respondWith(router.handle(request, event))
  event.respondWith(eventHandler(event))
})

async function eventHandler(event) {
  // const handlerImportName = 'createLogTransportHandler'
  const { [createHandlerImportName]: createHandler } = await import('../../lib/logTransportHandler/index.js')
  const handler = createHandler(...createHandlerArgs)

  const router = ThrowableRouter()
  router.all('*', handler)

  const { request } = event
  const response = await router.handle(request, event)
  return response
}
