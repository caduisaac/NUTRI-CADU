import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ShieldCheck, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Logo } from '@/components/ui/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isPasswordLongEnough = password.length >= 9
  const doPasswordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.')
      return
    }

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail.')
      return
    }

    // Regra: A senha deve ter no mínimo 9 caracteres
    if (password.length < 9) {
      setErrorMessage('A senha deve ter no mínimo 9 caracteres para garantir a segurança da sua conta.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem. Por favor, confira os campos de senha.')
      return
    }

    setLoading(true)

    try {
      const result = await signUp(name, email, password)

      if (!result.success) {
        setErrorMessage(result.error || 'Não foi possível criar sua conta. Verifique os dados e tente novamente.')
        setLoading(false)
        return
      }

      // Redireciona para o dashboard com sessão já estabelecida
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setErrorMessage('Erro ao conectar com o serviço de autenticação. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-radial-[at_top_left] from-emerald-100/60 via-slate-50 to-teal-50/40">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 -mt-20 -ml-20 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-80 h-80 rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[480px] z-10 flex flex-col items-center py-6">
        {/* Logotipo com o texto NUTRI CADU no topo */}
        <div className="mb-6 transition-transform hover:scale-105 duration-200">
          <Logo size="lg" />
        </div>

        <Card className="w-full border-emerald-100 shadow-2xl shadow-emerald-950/5">
          <CardHeader className="space-y-1.5 pb-5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Criar Conta de Nutricionista
            </h1>
            <p className="text-sm text-slate-500">
              Cadastre-se para começar a estruturar sua rotina clínica e atender com eficiência.
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {errorMessage && (
              <Alert
                variant="error"
                title="Erro no cadastro"
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Input
                label="Nome completo"
                type="text"
                placeholder="Dr(a). Seu Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="h-4 w-4" />}
                required
                autoComplete="name"
                autoFocus
              />

              <Input
                label="E-mail profissional"
                type="email"
                placeholder="exemplo@nutricionista.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                autoComplete="email"
              />

              <div className="space-y-1">
                <Input
                  label="Senha"
                  type="password"
                  placeholder="Mínimo 9 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  showPasswordToggle
                  required
                  autoComplete="new-password"
                />
                
                {/* Validador visual de comprimento mínimo de 9 caracteres */}
                <div className="flex items-center gap-1.5 pt-1 px-1 text-xs">
                  {password.length > 0 ? (
                    isPasswordLongEnough ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <Check className="h-3.5 w-3.5" /> Mínimo de 9 caracteres atingido ({password.length})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> Faltam {9 - password.length} caracteres para o mínimo de 9
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400">
                      * A senha deve ter no mínimo 9 caracteres
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Input
                  label="Confirmar senha"
                  type="password"
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  showPasswordToggle
                  required
                  autoComplete="new-password"
                />

                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1 px-1 text-xs">
                    {doPasswordsMatch ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <Check className="h-3.5 w-3.5" /> As senhas conferem
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> As senhas não coincidem
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-3 h-12 text-base shadow-lg shadow-emerald-600/25"
              >
                Criar Conta
              </Button>
            </form>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Seus dados são salvos com segurança no Neon Database</span>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <p className="text-sm text-slate-600">
              Já tem conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                Faça login
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Rodapé institucional */}
        <p className="mt-8 text-center text-xs text-slate-400">
          NUTRI CADU &copy; {new Date().getFullYear()} — Plataforma de Gestão Nutricional
        </p>
      </div>
    </div>
  )
}

