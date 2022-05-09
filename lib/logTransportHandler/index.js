const defaultConfig = {
  transport: async(logEvent, event) => console.log(logEvent)
}

export const createLogTransportHandler = (config = defaultConfig) => {
  const {
    transport
  } = {
    ...defaultConfig,
    ...config
  }

  return async (request, event) => {
    const logEvent = await request.json()
    event.waitUntil(transport(logEvent, event))
    return new Response(null, { status: 202 })
  }
}
