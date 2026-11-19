import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authClient, neonClient, fetchFreshJwt, setStoredJwt } from '@/lib/neon'
import type { AuthUser, AuthSession, AuthContextType } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LOCAL_STORAGE_USER_KEY = 'nutri_cadu_user'
const LOCAL_STORAGE_SESSION_KEY = 'nutri_cadu_session'

function translateAuthError(error: any): string {
  if (!error) return 'Ocorreu um erro inesperado. Tente novamente.'
  
  const msg = (error.message || error.statusText || String(error)).toLowerCase()
  const code = (error.code || '').toLowerCase()

  if (code === 'invalid_email_or_password' || msg.includes('invalid email or password') || msg.includes('invalid credentials')) {
    return 'E-mail ou senha incorretos. Por favor, verifique seus dados.'
  }
  if (code === 'user_already_exists' || msg.includes('user already exists') || msg.includes('already exists')) {
    return 'Já existe uma conta cadastrada com este e-mail. Faça login ou use outro e-mail.'
  }
  if (code === 'password_too_short' || msg.includes('password') && (msg.includes('short') || msg.includes('length'))) {
    return 'A senha deve conter no mínimo 9 caracteres.'
  }
  if (msg.includes('network') || msg.includes('failed to fetch')) {
    return 'Falha na conexão com os serviços do Neon. Verifique sua internet e tente novamente.'
  }

  return error.message || 'Não foi possível completar a operação. Tente novamente.'
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState<boolean>(true)

  const saveState = (newUser: AuthUser | null, newSession: AuthSession | null) => {
    setUser(newUser)
    setSession(newSession)
    try {
      if (newUser && newSession) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser))
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newSession))
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
        localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY)
      }
    } catch (e) {
      console.warn('Erro ao salvar sessão no localStorage:', e)
    }
  }

  const refreshSession = useCallback(async () => {
    try {
      const result: any = await authClient.getSession()
      if (result?.data?.session && result?.data?.user) {
        saveState(result.data.user, result.data.session)
        await fetchFreshJwt(result.data.session.token)
      } else {
        // Se a sessão expirou no backend
        saveState(null, null)
        setStoredJwt(null)
      }
    } catch (err) {
      console.error('Erro ao verificar sessão com o Neon Auth:', err)
      // Mantém a sessão local em caso de oscilação momentânea de rede se já existir
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result: any = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      })

      if (result?.error) {
        return { success: false, error: translateAuthError(result.error) }
      }

      const signedUser = result?.data?.user
      const signedSession = result?.data?.session || (result?.data?.token && signedUser ? {
        id: result.data.token,
        userId: signedUser.id,
        token: result.data.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      } : null)

      if (signedUser && signedSession) {
        saveState(signedUser, signedSession)
        await fetchFreshJwt(signedSession.token)
        return { success: true }
      }

      // Fallback: busca a sessão recém-criada
      const sessionResult: any = await authClient.getSession()
      if (sessionResult?.data?.user) {
        const sess = sessionResult?.data?.session || {
          id: 'session-' + Date.now(),
          userId: sessionResult.data.user.id,
          token: sessionResult.data.token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
        saveState(sessionResult.data.user, sess)
        await fetchFreshJwt(sess.token)
        return { success: true }
      }

      if (signedUser) {
        const sess = {
          id: 'session-' + Date.now(),
          userId: signedUser.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
        saveState(signedUser, sess)
        await fetchFreshJwt()
        return { success: true }
      }

      return { success: true }
    } catch (err: any) {
      console.error('Exceção ao fazer login:', err)
      return { success: false, error: translateAuthError(err) }
    }
  }

  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const trimmedEmail = email.trim().toLowerCase()
      const trimmedName = name.trim()

      const result: any = await authClient.signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
      })

      if (result?.error) {
        return { success: false, error: translateAuthError(result.error) }
      }

      const newUser = result?.data?.user
      const newSession = result?.data?.session || (result?.data?.token && newUser ? {
        id: result.data.token,
        userId: newUser.id,
        token: result.data.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      } : null)

      if (newUser) {
        const finalSession = newSession || {
          id: 'session-' + Date.now(),
          userId: newUser.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
        saveState(newUser, finalSession)

        // Salvar/sincronizar na tabela 'nutricionistas' via Neon Data API
        // O trigger no PostgreSQL já faz isso automaticamente, mas fazemos também como redundância
        try {
          await neonClient.from('nutricionistas').upsert({
            id: newUser.id,
            nome: trimmedName,
            email: trimmedEmail,
          })
        } catch (dbErr) {
          console.warn('Nota: Sincronização direta via Data API (o trigger do Neon já garantiu a gravação):', dbErr)
        }

        return { success: true }
      }

      // Se não veio user no retorno direto, busca a sessão
      const sessionResult: any = await authClient.getSession()
      if (sessionResult?.data?.user) {
        const sess = sessionResult?.data?.session || {
          id: 'session-' + Date.now(),
          userId: sessionResult.data.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
        saveState(sessionResult.data.user, sess)
      }

      return { success: true }
    } catch (err: any) {
      console.error('Exceção ao criar conta:', err)
      return { success: false, error: translateAuthError(err) }
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await authClient.signOut()
    } catch (err) {
      console.warn('Erro ao encerrar sessão no Neon:', err)
    } finally {
      setStoredJwt(null)
      saveState(null, null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}

