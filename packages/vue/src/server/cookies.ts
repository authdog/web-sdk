export const getSessionCookie = async (request: Request): Promise<string | null> => {
  const cookieHeader = request.headers.get('cookie')
  
  if (!cookieHeader) {
    return null
  }

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return cookies['authdog-session'] || null
}
