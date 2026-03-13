import type { H3Event } from 'h3'

/**
 * Get CSRF token from backend and forward cookies properly
 */
export async function getCsrfToken(
  event: H3Event
): Promise<{ token: string; cookieHeader: string }> {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  // Get a new CSRF token from the backend
  try {
    const response = await $fetch.raw<{ csrfToken: string }>(`${apiBase}/api/csrf-token`, {
      headers: {
        cookie: event.node.req.headers.cookie || '',
      },
      credentials: 'include',
    })

    // Extract the CSRF token from the response
    const csrfToken = response._data?.csrfToken
    if (!csrfToken) {
      throw new Error('No CSRF token in response')
    }

    // Get the Set-Cookie header from the backend response
    const setCookieHeaders = response.headers.getSetCookie?.() || []

    // Forward all cookies from backend to client
    for (const cookieHeader of setCookieHeaders) {
      appendResponseHeader(event, 'set-cookie', cookieHeader)
    }

    // Build cookie header for subsequent requests (includes the _csrf cookie from backend)
    const backendCookies = setCookieHeaders
      .map((header) => {
        const match = header.match(/^([^=]+)=([^;]+)/)
        return match ? `${match[1]}=${match[2]}` : ''
      })
      .filter(Boolean)
      .join('; ')

    // Combine with existing cookies from the original request
    const existingCookies = event.node.req.headers.cookie || ''
    const cookieHeader = existingCookies ? `${existingCookies}; ${backendCookies}` : backendCookies

    return { token: csrfToken, cookieHeader }
  } catch (error) {
    console.error('Failed to get CSRF token:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get CSRF token',
    })
  }
}
