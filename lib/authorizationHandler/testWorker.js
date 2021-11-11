import { ThrowableRouter } from 'itty-router-extras'
// import { createAuthorizationHandler } from './index.js'
//
// const rules = `allow_request(_user, request) if
// request.user == "test1";
// `
// const authorizationHandler = createAuthorizationHandler(
//   request => request.user,
//   request => request,
//   async oso => {
//     await oso.loadStr(rules)
//   }
// )

router
  // .all('*', authorizationHandler)
  .all('*', async request => {
    const { Oso } = await import('oso')
  })
  .all('*', request => new Response('Successfully authorized!'))

addEventListener('fetch', event => {
  event.respondWith(router.handle(event.request))
})
