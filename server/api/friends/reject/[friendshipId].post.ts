import { getCsrfToken } from '../../../utils/csrf'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const friendshipId = getRouterParam(event, 'friendshipId')
  const body = await readBody(event)

  // Get CSRF token - either from request header or fetch a new one
  let csrfToken = event.node.req.headers['x-csrf-token']
  let csrfTokenStr = Array.isArray(csrfToken) ? csrfToken[0] : (csrfToken || '')
  let cookieHeader = event.node.req.headers.cookie || ''

  // If no CSRF token provided, get one from the backend
  if (!csrfTokenStr) {
    const csrfData = await getCsrfToken(event)
    csrfTokenStr = csrfData.token
    cookieHeader = csrfData.cookieHeader
  }

  return await $fetch(`${apiBase}/api/friends/reject/${friendshipId}`, {
    method: 'POST',
    headers: {
      cookie: cookieHeader,
      'content-type': 'application/json',
      'x-csrf-token': csrfTokenStr,
    },
    body,
    credentials: 'include',
  })
})
