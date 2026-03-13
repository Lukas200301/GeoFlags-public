import { getCsrfToken } from '../../../utils/csrf'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  let apiBase = config.public.apiBase

  // Production fix: If we're on geoflags.org, use api.geoflags.org
  const host = getRequestHeader(event, 'host')
  if (host?.includes('geoflags.org') && !apiBase.includes('api.geoflags.org')) {
    apiBase = 'https://api.geoflags.org'
  }

  const battleId = getRouterParam(event, 'battleId')
  const body = await readBody(event)

  // Get CSRF token - either from request header or fetch a new one
  let csrfToken = event.node.req.headers['x-csrf-token']
  let csrfTokenStr = Array.isArray(csrfToken) ? csrfToken[0] : csrfToken || ''
  let cookieHeader = event.node.req.headers.cookie || ''

  // If no CSRF token provided, get one from the backend
  if (!csrfTokenStr) {
    const csrfData = await getCsrfToken(event)
    csrfTokenStr = csrfData.token
    cookieHeader = csrfData.cookieHeader
  }

  return await $fetch(`${apiBase}/api/battles/${battleId}/answer`, {
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
