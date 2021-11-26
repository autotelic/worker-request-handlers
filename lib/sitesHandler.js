import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { StatusError } from 'itty-router-extras'

const defaultConfig = {
  debug: false,
  responseHandler: async (request, assetResponse) => assetResponse
}

const workersSitesErrorHandler = async (e, event) => {
  try {
    const { status } = e
    const filePath = status == 404
      ? `${status}.html`
      : `${status}/index.html`
    const errorResponse = await getAssetFromKV(event, {
      mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/${filePath}`, req)
    })
    return new Response(errorResponse.body, { ...errorResponse, status })
  } catch (e) {
    throw e
  }
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
      // if a not found error is thrown try to serve the asset at 404.html
      if (e.message.startsWith('could not find') && e.message.endsWith('in your content namespace')) {
        return await workersSitesErrorHandler(new StatusError(404, e.message), event)
      }
      return new Response(e.message || e.toString(), { status: 500 })
    }
  }
}
