import { ThrowableRouter } from 'itty-router-extras'

export function createEventHandler(createHandler, createHandlerArgs) {
  const handler = createHandler(...createHandlerArgs)

  const router = ThrowableRouter()
  router.all('*', handler)

  return async event => {
    const { request } = event
    const response = await router.handle(request, event)
    return response
  }
}
