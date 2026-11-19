export interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  createdAt?: string | Date
  image?: string | null
}

export interface AuthSession {
  id: string
  userId: string
  expiresAt: string | Date
  token?: string
}

export interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

