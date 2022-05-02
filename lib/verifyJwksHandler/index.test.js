import test from 'ava'
import sinon from 'sinon'
import { KeyObject } from 'crypto'
import {
  createLocalJWKSet,
  SignJWT,
  errors,
  generateKeyPair,
  exportJWK
} from 'jose'
import { StatusError } from 'itty-router-extras'
import { createVerifyJwksHandler, getJWT, onNotVerified } from './index.js'

test.beforeEach(async (t) => {
  const { publicKey, privateKey } = await generateKeyPair('RS256')
  const publicJwk = await exportJWK(publicKey)

  const config = {
    getJwks: async request => createLocalJWKSet({
      keys: [publicJwk]
    })
  }

  t.context = {
    config,
    privateKey,
  }
})

test('verified', async t => {
  const { context } = t
  const { config, privateKey } = context
  const expectedPayload = { 'urn:example:claim': true }
  const expectedProtectedHeader = { alg: 'RS256' }
  const getTestJWT = async () => await new SignJWT(expectedPayload)
    .setProtectedHeader(expectedProtectedHeader)
    .sign(privateKey)
  const onVerifiedSpy = sinon.spy()
  const onNotVerifiedSpy = sinon.spy()
  const request = { foo: 'bar' }
  const verifyJwksHandler = createVerifyJwksHandler({
    ...config,
    getJWT: getTestJWT,
    onVerified: onVerifiedSpy,
    onNotVerified: onNotVerifiedSpy,
  })

  await t.notThrowsAsync(verifyJwksHandler(request))
  const { payload, protectedHeader, key } = onVerifiedSpy.getCall(0).args[1]
  t.deepEqual(onVerifiedSpy.getCall(0).args[0], { foo: 'bar' })
  t.true(onVerifiedSpy.calledOnce)
  t.true(onNotVerifiedSpy.notCalled)
  t.deepEqual(payload, expectedPayload)
  t.deepEqual(protectedHeader, expectedProtectedHeader)
  t.true(key instanceof KeyObject)
})

test('not verified', async t => {
  const { context: { config } } = t
  const getTestJWT = async () => ''
  const onVerifiedSpy = sinon.spy()
  const onNotVerifiedSpy = sinon.spy()
  const verifyJwksHandler = createVerifyJwksHandler({
    ...config,
    getJWT: getTestJWT,
    onVerified: onVerifiedSpy,
    onNotVerified: onNotVerifiedSpy,
  })
  await verifyJwksHandler({})
  t.true(onVerifiedSpy.notCalled)
  t.true(onNotVerifiedSpy.calledOnce)
  t.deepEqual(onNotVerifiedSpy.getCall(0).args[0], {})
  t.true(onNotVerifiedSpy.getCall(0).args[1] instanceof errors.JOSEError)
})

test('default getJWT no header', async t => {
  const requestStub = {
    headers: {
      get: sinon.stub().withArgs('Authorization').returns(null)
    }
  }
  const jwt = await getJWT(requestStub)
  t.is(jwt, null)
})

test('default getJWT with well-formed header', async t => {
  const requestStub = {
    headers: {
      get: sinon.stub().withArgs('Authorization').returns('Bearer JWT')
    }
  }
  const jwt = await getJWT(requestStub)
  t.is(jwt, 'JWT')
})

test('default getJWT with malformed header, wrong scheme', async t => {
  const requestStub = {
    headers: {
      get: sinon.stub().withArgs('Authorization').returns('Holder JWT')
    }
  }
  const error = await t.throwsAsync(getJWT(requestStub), {
    instanceOf: StatusError,
    message: 'Malformed Authorization header.',
  })
  t.is(error.status, 400)
})

test('default getJWT with malformed header, no jwt', async t => {
  const requestStub = {
    headers: {
      get: sinon.stub().withArgs('Authorization').returns('Bearer')
    }
  }
  const error = await t.throwsAsync(getJWT(requestStub), {
    instanceOf: StatusError,
    message: 'Malformed Authorization header.',
  })
  t.is(error.status, 400)
})

test('default onNotVerified is jose error', async t => {
  const joseError = new errors.JOSEError()
  const error = t.throws(() => onNotVerified({}, joseError), {
    instanceOf: StatusError,
    message: 'Invalid Access Token',
  })
  t.is(error.status, 401)
})

test('default onNotVerified non jose error passed through', async t => {
  const error = t.throws(() => onNotVerified({}, new TypeError('some issue')), {
    instanceOf: TypeError,
    message: 'some issue',
  })
})
