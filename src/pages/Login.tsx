import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Sparkles, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Logo } from '@/components/ui/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail de acesso.')
      return
    }

    if (!password) {
      setErrorMessage('Por favor, digite sua senha.')
      return
    }

    setLoading(true)

    try {
      const result = await signIn(email, password)

      if (!result.success) {
        setErrorMessage(result.error || 'E-mail ou senha incorretos.')
        setLoading(false)
        return
      }

      // Redireciona para o dashboard
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setErrorMessage('Erro ao autenticar. Verifique sua conexão e tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-radial-[at_top_right] from-emerald-100/60 via-slate-50 to-emerald-50/40">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] z-10 flex flex-col items-center">
        {/* Logotipo com o texto NUTRI CADU no topo */}
        <div className="mb-8 transition-transform hover:scale-105 duration-200">
          <Logo size="lg" />
        </div>

        <Card className="w-full border-emerald-100 shadow-2xl shadow-emerald-950/5">
          <CardHeader className="space-y-1.5 pb-5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Acesse sua conta
            </h1>
            <p className="text-sm text-slate-500">
              Digite seu e-mail e senha para gerenciar seus pacientes e planos alimentares.
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {errorMessage && (
              <Alert
                variant="error"
                title="Não foi possível entrar"
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="E-mail profissional"
                type="email"
                placeholder="exemplo@nutricionista.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                autoComplete="email"
                autoFocus
              />

              <Input
                label="Senha"
                type="password"
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                showPasswordToggle
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2 h-12 text-base shadow-lg shadow-emerald-600/25"
              >
                Entrar no Sistema
              </Button>
            </form>

            <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Autenticação segura via Neon Auth</span>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <p className="text-sm text-slate-600">
              Não tem conta?{' '}
              <Link
                to="/cadastro"
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                Cadastre-se
              </Link>
            </p>

            <div className="flex items-center gap-1.5 text-xs text-emerald-700/80 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              <span>Plataforma especializada em gestão nutricional</span>
            </div>
          </CardFooter>
        </Card>

        {/* Rodapé institucional */}
        <p className="mt-8 text-center text-xs text-slate-400">
          NUTRI CADU &copy; {new Date().getFullYear()} — Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}

