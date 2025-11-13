export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const query = getQuery(event)

  const queryString = new URLSearchParams(query as Record<string, string>).toString()

  return await $fetch(`${apiBase}/api/friends/search?${queryString}`, {
    method: 'GET',
    headers: {
      cookie: event.node.req.headers.cookie || '',
    },
    credentials: 'include',
  })
})
