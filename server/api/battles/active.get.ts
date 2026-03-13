export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  let apiBase = config.public.apiBase

  // Production fix: If we're on geoflags.org, use api.geoflags.org
  const host = getRequestHeader(event, 'host')
  if (host?.includes('geoflags.org') && !apiBase.includes('api.geoflags.org')) {
    apiBase = 'https://api.geoflags.org'
  }

  // Forward all headers from the client request, especially cookies
  const headers: Record<string, string> = {}
  const requestHeaders = getRequestHeaders(event)

  // Forward important headers
  if (requestHeaders.cookie) headers.cookie = requestHeaders.cookie
  if (requestHeaders.authorization) headers.authorization = requestHeaders.authorization
  if (requestHeaders['user-agent']) headers['user-agent'] = requestHeaders['user-agent']

  return await $fetch(`${apiBase}/api/battles/active`, {
    method: 'GET',
    headers,
    credentials: 'include',
  })
})
