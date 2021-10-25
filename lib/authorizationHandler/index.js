import { StatusError } from 'itty-router-extras'
import getOso from './getOso.js'

export const createAuthorizationHandler = (
  getUser = async () => {},
  getRequest = async request => request,
  setupOso = async oso => {}
) => {
  return async (request, event, config) => {
    const oso = await getOso(setupOso)
    const user = await getUser(request, event, config)
    const req = await getRequest(request, event, config)
    try {
      await oso.authorizeRequest(user, req)
    } catch (e) {
      throw new StatusError(403, 'You are not authorized to view this site')
    }
  }
}
