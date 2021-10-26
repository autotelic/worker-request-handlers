const BaseException = (message, status) => ({ message, status })
const BadRequestException = message => BaseException(message, 400)
const UnauthorizedException = message => BaseException(message, 401)

const parseAuthorizationHeader = authorizationHeader => {
  const [scheme, encoded] = authorizationHeader.split(' ')
  // The Authorization header must start with "Basic", followed by a space.
  if (!encoded || scheme !== 'Basic') {
    throw BadRequestException('Malformed authorization header.')
  }
  // Decodes the base64 value and performs unicode normalization.
  // @see https://datatracker.ietf.org/doc/html/rfc7613#section-3.3.2 (and #section-4.2.2)
  // @see https://dev.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
  const decoded = atob(encoded).normalize()

  // The username & password are split by the first colon.
  //= > example: "username:password"
  const index = decoded.indexOf(':')
  // and MUST NOT contain control characters.
  // @see https://tools.ietf.org/html/rfc5234#appendix-B.1 (=> "CTL = %x00-1F / %x7F")
  if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
    throw BadRequestException('Invalid authorization value.')
  }
  return {
    user: decoded.substring(0, index),
    pass: decoded.substring(index + 1)
  }
}

export const basicAuthenticationHandler = async (request, event, config = {
  verifyCredentials: (user, pass) => false,
  debug: true
}) => {
  const url = new URL(request.url)
  const { protocol, pathname } = url
  const { verifyCredentials, debug } = config

  if (debug && pathname === '/basic-auth-logout') {
    throw UnauthorizedException('Logged out')
  }

  if (!debug) {
    if (protocol !== 'https:' || request.headers.get('x-forwarded-proto') !== 'https') {
      throw BadRequestException('Please use a HTTPS connection!')
    }
  }
  const authorizationHeader = request.headers.get('Authorization')
  if (authorizationHeader) {
    const { user, pass } = parseAuthorizationHeader(authorizationHeader)
    const verified = await verifyCredentials(user, pass)
    if (!verified) {
      throw UnauthorizedException('Invalid credentials')
    }
  } else {
    return new Response('You need to login.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="some scope", charset="UTF-8"'
      }
    })
  }
}

export const createKVCredentialsVerifier = KV_NAMESPACE => {
  return async (user, pass) => {
    const USER = await KV_NAMESPACE.get('USER')
    const PASS = await KV_NAMESPACE.get('PASS')
    return user === USER && pass === PASS
  }
}
