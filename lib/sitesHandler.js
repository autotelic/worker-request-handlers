const { getAssetFromKV, mapRequestToAsset } = require('@cloudflare/kv-asset-handler')

const sitesHandler = async (request, event, config = {
  debug: true
}) => {
  const url = new URL(request.url)
  const options = {}
  const { debug: DEBUG } = config

  try {
    // bypass cache if we are developing
    if (DEBUG) {
      options.cacheControl = {
        bypassCache: true
      }
    }
    return await getAssetFromKV(event, options)
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

module.exports = { sitesHandler }
