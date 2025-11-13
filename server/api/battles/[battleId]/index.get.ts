export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  let apiBase = config.public.apiBase

  // Production fix: If we're on geoflags.org, use api.geoflags.org
  const host = getRequestHeader(event, 'host')
  if (host?.includes('geoflags.org') && !apiBase.includes('api.geoflags.org')) {
    apiBase = 'https://api.geoflags.org'
  }

  const battleId = getRouterParam(event, 'battleId')

  return await $fetch(`${apiBase}/api/battles/${battleId}`, {
    method: 'GET',
    headers: {
      cookie: event.node.req.headers.cookie || '',
    },
    credentials: 'include',
  })
})
