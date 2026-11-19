import { createClient } from '@neon/neon-js'
import { createAuthClient } from '@neon/neon-js/auth'

export const AUTH_URL =
  import.meta.env.VITE_NEON_AUTH_URL ||
  'https://ep-nameless-haze-b6lbyzuc.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth'

export const DATA_API_URL =
  import.meta.env.VITE_NEON_DATA_API_URL ||
  'https://ep-nameless-haze-b6lbyzuc.apirest.c-2.sa-east-1.aws.neon.tech/neondb/rest/v1'

export const DATABASE_URL =
  import.meta.env.VITE_NEON_DATABASE_URL ||
  'https://ep-nameless-haze-b6lbyzuc.c-2.sa-east-1.aws.neon.tech/neondb'

export const JWT_STORAGE_KEY = 'nutri_cadu_jwt'

export function getStoredJwt(): string | null {
  try {
    return localStorage.getItem(JWT_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredJwt(jwt: string | null) {
  try {
    if (jwt) {
      localStorage.setItem(JWT_STORAGE_KEY, jwt)
    } else {
      localStorage.removeItem(JWT_STORAGE_KEY)
    }
  } catch (err) {
    console.warn('Erro ao salvar JWT:', err)
  }
}

export async function fetchFreshJwt(sessionToken?: string): Promise<string | null> {
  try {
    const headers: Record<string, string> = {}
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`
    }
    const res = await fetch(`${AUTH_URL}/get-session`, {
      method: 'GET',
      credentials: 'include',
      headers,
    })
    const jwt = res.headers.get('set-auth-jwt')
    if (jwt) {
      setStoredJwt(jwt)
      return jwt
    }
  } catch (err) {
    console.warn('Falha ao obter JWT do Neon Auth:', err)
  }
  return null
}

export const neonClient = createClient({
  dataApi: {
    url: DATA_API_URL,
    getToken: async () => {
      const existing = getStoredJwt()
      if (existing) return existing
      return await fetchFreshJwt()
    },
  },
})

export const authClient = createAuthClient(AUTH_URL)
