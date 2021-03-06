/* global crypto */

import base64url from 'base64url'
import { RequestCookieStore } from '@worker-tools/request-cookie-store'
import { StatusError } from 'itty-router-extras'
import { toHexString, fromHexString } from './utils'

export const createCookieEncryptor = (opts) => {
  const {
    cookieName,
    encryptionKey,
    keyAlgorithm = 'AES-GCM',
    missingCookieHandler = async () => {
      throw new StatusError(400, 'Missing required cookie.')
    }
  } = opts

  const getKey = async () => {
    try {
      return crypto.subtle.importKey(
        'raw',
        base64url.toBuffer(encryptionKey),
        { name: keyAlgorithm },
        false,
        ['encrypt', 'decrypt']
      )
    } catch (e) {
      throw new StatusError(400, e.message || e.toString())
    }
  }

  const encrypt = async str => {
    try {
      const key = await getKey(keyAlgorithm)
      const iv = crypto.getRandomValues(new Uint8Array(16))
      const encoder = new TextEncoder()
      const data = encoder.encode(str)
      const encrypted = await crypto.subtle.encrypt({ name: keyAlgorithm, iv }, key, data)
      return `${toHexString(iv)}${base64url(encrypted)}`
    } catch (e) {
      throw new StatusError(400, e.message || e.toString())
    }
  }

  const decrypt = async str => {
    try {
      const iv = fromHexString(str.slice(0, 32))
      const token = str.slice(32)
      const key = await getKey(keyAlgorithm)
      const decrypted = await crypto.subtle.decrypt({
        name: keyAlgorithm, iv
      }, key, base64url.toBuffer(token))
      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (e) {
      throw new StatusError(400, e.message || e.toString())
    }
  }

  const extractToken = (request) => {
    const { cookies } = request
    return cookies ? cookies[cookieName] : null
  }

  const decryptionHandler = async (request, event, config) => {
    try {
      const cookieStore = new RequestCookieStore(request)
      const allCookies = await cookieStore.getAll()
      const cookieObj = allCookies.reduce((obj, { name, value }) => {
        obj[name] = value
        return obj
      }, {})
      const hasCookie = Object.prototype.hasOwnProperty.call(cookieObj, cookieName)
      if (hasCookie) {
        const decrypted = await decrypt(cookieObj[cookieName])
        cookieObj[cookieName] = decrypted
        request.cookies = cookieObj
      } else {
        return await missingCookieHandler(request, event)
      }
    } catch (e) {
      throw new StatusError(400, e.message || e.toString())
    }
  }

  return {
    encrypt,
    decrypt,
    extractToken,
    decryptionHandler
  }
}
