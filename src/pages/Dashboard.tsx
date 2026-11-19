import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  CalendarDays,
  UserX,
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Plus
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { neonClient } from '@/lib/neon'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import type { Paciente, Consulta, PacienteSemRetorno } from '@/types/database'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Card 1 — Total de pacientes ativos
  const [totalPacientes, setTotalPacientes] = useState<number>(0)

  // Card 2 — Consultas da semana
  const [consultasSemanaCount, setConsultasSemanaCount] = useState<number>(0)
  const [intervaloSemanaTexto, setIntervaloSemanaTexto] = useState<string>('')

  // Card 3 — Pacientes sem retorno
  const [pacientesSemRetorno, setPacientesSemRetorno] = useState<PacienteSemRetorno[]>([])

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (!user) return

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      // 1. Carrega todos os pacientes do nutricionista logado
      const { data: pacientesData, error: pError } = await neonClient
        .from('pacientes')
        .select('*')
        .order('nome', { ascending: true })

      if (pError) throw pError

      const pacientes: Paciente[] = pacientesData || []
      setTotalPacientes(pacientes.length)

      // 2. Carrega todas as consultas vinculadas aos pacientes do nutricionista
      const { data: consultasData, error: cError } = await neonClient
        .from('consultas')
        .select('*')
        .order('data_consulta', { ascending: false })

      if (cError) throw cError

      const consultas: Consulta[] = consultasData || []

      // 3. Calcula Consultas da Semana Atual
      const now = new Date()
      // Dia da semana: 0 é domingo, 1 é segunda...
      const currentDay = now.getDay()
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay
      
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() + diffToMonday)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      const startStr = startOfWeek.toISOString().split('T')[0]
      const endStr = endOfWeek.toISOString().split('T')[0]

      const consultasSemana = consultas.filter((c) => {
        return c.data_consulta >= startStr && c.data_consulta <= endStr
      })
      setConsultasSemanaCount(consultasSemana.length)

      const formatBr = (d: Date) =>
        d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      setIntervaloSemanaTexto(`${formatBr(startOfWeek)} a ${formatBr(endOfWeek)}`)

      // 4. Calcula Card 3 — Pacientes sem retorno (> 30 dias sem consulta e sem retorno agendado)
      const listaSemRetorno: PacienteSemRetorno[] = []

      for (const p of pacientes) {
        // Encontra todas as consultas desse paciente
        const consPaciente = consultas.filter((c) => c.paciente_id === p.id)

        if (consPaciente.length > 0) {
          // A mais recente
          const ultimaConsulta = consPaciente[0]
          const dataUltima = new Date(ultimaConsulta.data_consulta + 'T12:00:00')
          const diffMs = now.getTime() - dataUltima.getTime()
          const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

          // Verifica se possui próximo retorno futuro agendado
          const temRetornoFuturo = consPaciente.some((c) => {
            if (!c.proximo_retorno) return false
            const retDate = new Date(c.proximo_retorno + 'T23:59:59')
            return retDate >= now
          })

          if (dias > 30 && !temRetornoFuturo) {
            listaSemRetorno.push({
              id: p.id,
              nome: p.nome,
              email: p.email,
              telefone: p.telefone || p.whatsapp,
              ultimaConsultaId: ultimaConsulta.id,
              ultimaConsultaData: ultimaConsulta.data_consulta,
              diasSemConsulta: dias,
            })
          }
        }
      }

      // Ordena por maior tempo sem consulta
      listaSemRetorno.sort((a, b) => b.diasSemConsulta - a.diasSemConsulta)
      setPacientesSemRetorno(listaSemRetorno)
    } catch (err: any) {
      console.error('Erro ao buscar dados do dashboard no Neon:', err)
      setError('Não foi possível carregar os dados em tempo real do banco de dados.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const hojeFormatado = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Cabeçalho de Boas-Vindas */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Visão Geral Clínica</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Olá, Dr(a). {user?.name?.split(' ')[0] || 'Nutricionista'}
            </h1>
            <p className="text-sm text-slate-500 capitalize mt-0.5">{hojeFormatado}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDashboardData(true)}
              loading={refreshing}
              className="gap-2 bg-white"
              title="Atualizar dados do Neon em tempo real"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar Dados</span>
            </Button>

            <Link to="/pacientes">
              <Button size="sm" className="gap-2 shadow-sm shadow-emerald-600/20">
                <Plus className="h-4 w-4" />
                <span>Novo Paciente</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mensagem de Erro se houver */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => loadDashboardData(true)}>
              Tentar novamente
            </Button>
          </div>
        )}

        {/* =========================================================================
            CARDS DE INFORMAÇÃO PRINCIPAIS
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* -------------------------------------------------------------
              CARD 1 — Total de pacientes ativos
              ------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-7 shadow-lg shadow-slate-200/40 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-950/5 flex flex-col justify-between">
            <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Card 1 • Pacientes
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 shadow-xs">
                  <Users className="h-6 w-6 stroke-[2.2]" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mt-3">
                Total de Pacientes Ativos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cadastrados sob seus cuidados
              </p>

              <div className="mt-6 flex items-baseline gap-3">
                {loading ? (
                  <div className="h-12 w-24 bg-slate-200 animate-pulse rounded-xl" />
                ) : (
                  <>
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {totalPacientes}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/50">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      ativos
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Dados do Neon em tempo real</span>
              <Link
                to="/pacientes"
                className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
              >
                Gerenciar pacientes
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* -------------------------------------------------------------
              CARD 2 — Consultas da semana
              ------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-7 shadow-lg shadow-slate-200/40 transition-all duration-200 hover:shadow-xl hover:shadow-teal-950/5 flex flex-col justify-between">
            <div className="absolute top-0 right-0 h-32 w-32 bg-teal-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Card 2 • Agenda
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100/80 shadow-xs">
                  <CalendarDays className="h-6 w-6 stroke-[2.2]" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mt-3">
                Consultas da Semana
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-teal-600" />
                <span>{intervaloSemanaTexto || 'Semana atual'}</span>
              </p>

              <div className="mt-6 flex items-baseline gap-3">
                {loading ? (
                  <div className="h-12 w-24 bg-slate-200 animate-pulse rounded-xl" />
                ) : (
                  <>
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {consultasSemanaCount}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200/50">
                      registradas
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Segunda a Domingo</span>
              <span className="text-teal-700 font-medium">Acompanhamento contínuo</span>
            </div>
          </div>

          {/* -------------------------------------------------------------
              Resumo / Indicador de Saúde do Consultório
              ------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-7 shadow-lg shadow-emerald-950/10 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Segurança & Privacidade
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                Ambiente Clínico Protegido
              </h2>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Todas as consultas e prontuários possuem isolamento de dados com <strong>Row Level Security (RLS)</strong> no banco Neon. Apenas o seu usuário tem acesso às informações de seus pacientes.
              </p>
            </div>

            <div className="pt-6 border-t border-emerald-700/60 flex items-center justify-between text-xs">
              <span className="text-emerald-200 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                RLS Ativo no Postgres
              </span>
              <span className="text-emerald-300 font-mono text-[11px]">ID: {user?.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CARD 3 — Pacientes sem retorno (Área expandida com lista)
            ========================================================================= */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-white via-slate-50/50 to-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-xs">
                <UserX className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Card 3 • Pacientes Sem Retorno
                  </h2>
                  {!loading && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        pacientesSemRetorno.length > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {pacientesSemRetorno.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado
                </p>
              </div>
            </div>

            {pacientesSemRetorno.length > 0 && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                Requer contato para reagendamento
              </span>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-full bg-slate-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : pacientesSemRetorno.length === 0 ? (
              /* REGRA DO PROMPT 3:
                 Se não houver pacientes sem retorno, exibir a mensagem "Nenhum paciente sem retorno no momento" */
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-4">
                  <CheckCircle2 className="h-8 w-8 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Nenhum paciente sem retorno no momento
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                  Todos os seus pacientes estão com consultas recentes ou com retornos futuros devidamente agendados na sua agenda clínica.
                </p>
              </div>
            ) : (
              /* REGRA DO PROMPT 3:
                 Exibe uma lista com o nome dos pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado.
                 Cada nome da lista deve ser clicável e redirecionar para o perfil do paciente. */
              <div className="divide-y divide-slate-100">
                {pacientesSemRetorno.map((paciente) => {
                  const dataConsultaFormatada = new Date(
                    paciente.ultimaConsultaData + 'T12:00:00'
                  ).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })

                  return (
                    <Link
                      key={paciente.id}
                      to={`/pacientes/${paciente.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-emerald-50/70 transition-all duration-150 gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                          {paciente.nome.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm sm:text-base">
                              {paciente.nome}
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                            {paciente.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-slate-400" />
                                {paciente.email}
                              </span>
                            )}
                            {paciente.telefone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-slate-400" />
                                {paciente.telefone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-14 sm:pl-0">
                        <div className="text-left sm:text-right">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            <span>Há {paciente.diasSemConsulta} dias</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Última consulta: {dataConsultaFormatada}
                          </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
