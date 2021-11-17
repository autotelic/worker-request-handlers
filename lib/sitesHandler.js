const { getAssetFromKV } = require('@cloudflare/kv-asset-handler')

const defaultConfig = {
  debug: false,
  responseHandler: async (request, assetResponse) => assetResponse
}

export const createSitesHandler = (config = defaultConfig) => {
  return async (request, event) => {
    const url = new URL(request.url)
    const options = {}
    const {
      debug: DEBUG,
      responseHandler
    } = {
      ...defaultConfig,
      ...config
    }

    try {
      // bypass cache if we are developing
      if (DEBUG) {
        options.cacheControl = {
          bypassCache: true
        }
      }
      const assetResponse = await getAssetFromKV(event, options)
      const finalResponse = await responseHandler(request, assetResponse, {
        ...defaultConfig,
        ...config
      })
      const { body: assetBody } = finalResponse
      return new Response(assetBody, finalResponse)
    } catch (e) {
      // if an error is thrown try to serve the asset at 404.html
      if (!DEBUG) {
        try {
          const notFoundResponse = await getAssetFromKV(event, {
            mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/404.html`, req)
          })
          return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 })
        } catch (e) {}
      }
      return new Response(e.message || e.toString(), { status: 500 })
    }
  }
}
