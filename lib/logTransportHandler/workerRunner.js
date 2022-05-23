import { createEventHandler } from '../../util/worker/createEventHandler'
import { createLogTransportHandler } from './index.js'

const eventHandler = createEventHandler(createLogTransportHandler, createHandlerArgs)

addEventListener('fetch', event => event.respondWith(eventHandler(event)))
