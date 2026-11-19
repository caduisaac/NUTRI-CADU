import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Search,
  Plus,
  Calendar,
  Target,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { neonClient } from '@/lib/neon'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { formatDateBr } from '@/lib/formatters'
import type { Paciente, Consulta } from '@/types/database'

interface PacienteComUltimaConsulta extends Paciente {
  ultimaConsultaData?: string | null
  objetivoFormatado: string
}

export const Pacientes: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [pacientes, setPacientes] = useState<PacienteComUltimaConsulta[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const carregarPacientes = useCallback(async (isRefresh = false) => {
    if (!user) return

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      // 1. Carrega todos os pacientes da nutricionista logada
      const { data: pData, error: pError } = await neonClient
        .from('pacientes')
        .select('*')
        .order('nome', { ascending: true })

      if (pError) throw pError

      const pacientesRaw: Paciente[] = pData || []

      // 2. Carrega as consultas para determinar a última consulta de cada paciente
      const { data: cData, error: cError } = await neonClient
        .from('consultas')
        .select('*')
        .order('data_consulta', { ascending: false })

      if (cError) throw cError

      const consultasRaw: Consulta[] = cData || []

      // Mapeia com objetivo e data da última consulta
      const formatados: PacienteComUltimaConsulta[] = pacientesRaw.map((p) => {
        // Encontra consultas desse paciente
        const consPaciente = consultasRaw.filter((c) => c.paciente_id === p.id)
        const ultimaConsulta = consPaciente[0]?.data_consulta || null

        // Formatação do objetivo
        let objStr = ''
        if (p.objetivos && p.objetivos.length > 0) {
          objStr = p.objetivos.join(', ')
        }
        if (p.objetivo_texto) {
          objStr = objStr ? `${objStr} (${p.objetivo_texto})` : p.objetivo_texto
        }
        if (!objStr) {
          objStr = 'Não especificado'
        }

        return {
          ...p,
          ultimaConsultaData: ultimaConsulta,
          objetivoFormatado: objStr,
        }
      })

      setPacientes(formatados)
    } catch (err: any) {
      console.error('Erro ao carregar lista de pacientes do Neon:', err)
      setError('Não foi possível carregar os pacientes no momento. Tente novamente.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    carregarPacientes()
  }, [carregarPacientes])

  // Filtro de busca por nome
  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase().trim())
  )

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-12">
        {/* Cabeçalho da Lista */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Gestão de Pacientes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Lista de Pacientes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Gerencie seus pacientes, consulte prontuários e acompanhe as datas de retorno
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => carregarPacientes(true)}
              loading={refreshing}
              className="gap-2 bg-white"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>

            {/* Botão Novo Paciente que redireciona para o formulário de cadastro */}
            <Link to="/pacientes/novo">
              <Button size="sm" className="gap-2 shadow-sm shadow-emerald-600/20">
                <Plus className="h-4 w-4" />
                <span>Novo Paciente</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => carregarPacientes(true)}>
              Recarregar
            </Button>
          </div>
        )}

        {/* Campo de busca por nome no topo da listagem */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar paciente por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {/* -------------------------------------------------------------
            LISTAGEM DE PACIENTES
            ------------------------------------------------------------- */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 w-full bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : pacientes.length === 0 ? (
            /* REGRA DO PROMPT 4:
               Se não houver pacientes cadastrados, exibir a mensagem "Nenhum paciente cadastrado ainda" */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-4 shadow-sm">
                <Users className="h-8 w-8 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Nenhum paciente cadastrado ainda
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
                Você ainda não possui pacientes vinculados ao seu consultório. Clique no botão abaixo para preencher o formulário de anamnese e cadastrar seu primeiro paciente.
              </p>
              <Link to="/pacientes/novo">
                <Button className="gap-2 shadow-md shadow-emerald-600/20">
                  <Plus className="h-4 w-4" />
                  <span>Cadastrar Primeiro Paciente</span>
                </Button>
              </Link>
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Nenhum paciente encontrado com o nome "{searchTerm}"
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tente verificar a ortografia ou limpe o campo de busca.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pacientesFiltrados.map((paciente) => (
                <div
                  key={paciente.id}
                  onClick={() => navigate(`/pacientes/${paciente.id}`)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-emerald-50/70 transition-all duration-150 cursor-pointer gap-4"
                >
                  {/* Nome e Avatar */}
                  <div className="flex items-center gap-3.5 min-w-[260px]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-black text-base group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                      {paciente.nome.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-base">
                          {paciente.nome}
                        </h4>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {paciente.telefone || paciente.email || 'Sem contato registrado'}
                      </p>
                    </div>
                  </div>

                  {/* Objetivo */}
                  <div className="flex-1 sm:px-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Objetivo
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Target className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold line-clamp-1">
                        {paciente.objetivoFormatado}
                      </span>
                    </div>
                  </div>

                  {/* Data da Última Consulta */}
                  <div className="sm:text-right shrink-0 min-w-[180px]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Última Consulta
                    </span>
                    <div className="flex sm:justify-end items-center gap-1.5 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {paciente.ultimaConsultaData
                          ? formatDateBr(paciente.ultimaConsultaData)
                          : 'Nenhuma consulta'}
                      </span>
                    </div>
                  </div>

                  {/* Seta indicador de clique */}
                  <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs ml-2">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
