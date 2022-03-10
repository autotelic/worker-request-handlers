export const toHexString = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')

export const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

export const generateStateParam = async (kvStore, value, expirationTtl = 600) => {
  const state = toHexString(crypto.getRandomValues(new Uint8Array(16)))
  await kvStore.put(state, JSON.stringify(value), { expirationTtl })
  return state
}
