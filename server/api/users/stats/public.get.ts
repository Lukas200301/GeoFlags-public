export default defineEventHandler(async (): Promise<any> => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  return await $fetch(`${apiBase}/api/users/stats/public`, {
    method: 'GET',
  })
})
