import { Logger } from '@autotelic/worker-logger'

export const createLoggableEventHandler = ({
  router,
  logOptions = {}
}) => {
  const log = new Logger(logOptions)

  return async event => {
    const request = new Request(event.request)
    request.log = log
    const res = await router.handle(request, event)
    event.waitUntil(request.log.report())
    return res
  }
}
