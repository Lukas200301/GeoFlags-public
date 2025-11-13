export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  // Forward all headers from the client request, especially cookies
  const headers: Record<string, string> = {}
  const requestHeaders = getRequestHeaders(event)
  
  // Forward important headers
  if (requestHeaders.cookie) headers.cookie = requestHeaders.cookie
  if (requestHeaders.authorization) headers.authorization = requestHeaders.authorization
  if (requestHeaders['user-agent']) headers['user-agent'] = requestHeaders['user-agent']

  return await $fetch(`${apiBase}/api/game/modes`, {
    method: 'GET',
    headers,
    credentials: 'include',
  })
})
