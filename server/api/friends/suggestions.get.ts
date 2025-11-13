export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  return await $fetch(`${apiBase}/api/friends/suggestions`, {
    method: 'GET',
    headers: {
      cookie: event.node.req.headers.cookie || '',
    },
    credentials: 'include',
  })
})
