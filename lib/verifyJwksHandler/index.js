import { StatusError } from 'itty-router-extras'
import { jwtVerify, errors } from 'jose'

export const getJWT = async request => {
  const authorizationHeader = request.headers.get('Authorization')
  if (authorizationHeader === null) {
    return null
  }

  const [scheme, jwt] = authorizationHeader.split(' ')

  if (!jwt || scheme !== 'Bearer') {
    throw new StatusError(400, 'Malformed Authorization header.')
  }

  return jwt
}

export const onNotVerified = async (request, error) => {
  if (error instanceof errors.JOSEError) {
    // TODO (eadmundo): differentiate between different JOSE errors for logging
    // https://github.com/panva/jose/blob/main/docs/modules/util_errors.md#readme
    throw new StatusError(401, 'Invalid Access Token')
  }
  else {
    // this isn't expected so re-throw
    throw error
  }
}

const defaultConfig = {
  getJwks: async request => null,
  getJWT,
  onVerified: (request, verificationResult) => {},
  onNotVerified: () => {},
}

export const createVerifyJwksHandler = (config = defaultConfig) => {
  const {
    getJwks,
    getJWT,
    onVerified,
    onNotVerified
  } = {
    ...defaultConfig,
    ...config
  }

  return async (request, event) => {
    const jwks = await getJwks(request)
    console.log('jwks', jwks)
    const jwt = await getJWT(request)
    console.log('jwt', jwt)

    if (jwt !== null) {
      try {
        const verificationResult = await jwtVerify(jwt, jwks)
        onVerified(request, verificationResult)
      } catch (error) {
        await onNotVerified(request, error)
      }
    }
  }
}
