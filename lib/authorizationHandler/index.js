import { StatusError } from 'itty-router-extras'
import getOso from './getOso.js'

const defaultConfig = {
  getUser: async () => {},
  getRequest: async request => request,
  setupOso: async oso => {},
  throwErrors: true,
  authorizationErrorMessage: 'You are not authorized to view this site'
}

export const createAuthorizationHandler = (config = defaultConfig) => {
  return async (request, event) => {
    const {
      getUser,
      getRequest,
      setupOso,
      throwErrors,
      authorizationErrorMessage
    } = {
      ...defaultConfig,
      ...config
    }
    const [oso, user, req] = await Promise.all([
      await getOso(setupOso),
      await getUser(request, event),
      await getRequest(request, event)
    ])
    try {
      await oso.authorizeRequest(user, req)
      request.authorized = true
    } catch (e) {
      if (throwErrors) {
        throw new StatusError(403, authorizationErrorMessage)
      } else {
        request.authorized = false
        request.authorizationError = e.message
      }
    }
  }
}
