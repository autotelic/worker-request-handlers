import {
  SignJWT,
  generateKeyPair,
  exportJWK
} from 'jose'

;(async () => {
  const { publicKey, privateKey } = await generateKeyPair('RS256')
  const publicJwk = await exportJWK(publicKey)
  const jwt = await new SignJWT({ 'urn:example:claim': true })
    .setProtectedHeader({ alg: 'RS256' })
    .sign(privateKey)
  console.log(`public jwk:\n\n`, publicJwk)
  console.log(`\n\njwt:\n\n`, jwt, '\n')
})()
