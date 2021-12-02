import { ThrowableRouter } from 'itty-router-extras'
import { createCookieEncryptor } from './index.js'

const { decrypt, encrypt, extractToken, decryptionHandler } = createCookieEncryptor({
  cookieName: 'cookieName',
  encryptionKey: 'm1wGHPBiT3psGFbuT6tPYbnQ5cC7HdhcgRzwit551io'
})

const router = ThrowableRouter()

