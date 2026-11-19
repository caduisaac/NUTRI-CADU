import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Mail,
  Plus,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Scale,
  Ruler,
  User,
  Heart,
  Activity,
  Droplets,
  Utensils,
  Sun,
  Moon,
  Dumbbell,
  Target,
  Pill,
  ShieldCheck,
  X
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { neonClient } from '@/lib/neon'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  calculateAge,
  calculateImc,
  formatDateBr
} from '@/lib/formatters'
import type { Paciente, Consulta } from '@/types/database'

export const PacienteDetalhe: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)

  // Modal Agendar Nova Consulta / Retorno
  const [modalOpen, setModalOpen] = useState(false)
  const [dataConsulta, setDataConsulta] = useState(new Date().toISOString().split('T')[0])
  const [proximoRetorno, setProximoRetorno] = useState('')
  const [peso, setPeso] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)

  const carregarDados = useCallback(async () => {
    if (!id || !user) return
    setLoading(true)

    try {
      // 1. Busca paciente
      const { data: pData, error: pError } = await neonClient
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (pError) throw pError
      setPaciente(pData)

      // 2. Busca histórico de consultas
      const { data: cData, error: cError } = await neonClient
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false })

      if (cError) throw cError
      setConsultas(cData || [])
    } catch (err) {
      console.error('Erro ao buscar dados do paciente no Neon:', err)
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const handleSalvarConsulta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSalvando(true)
    try {
      const { error } = await neonClient.from('consultas').insert({
        paciente_id: id,
        data_consulta: dataConsulta,
        proximo_retorno: proximoRetorno || null,
        peso: peso ? parseFloat(peso) : null,
        observacoes: observacoes || null,
      })

      if (error) throw error

      setModalOpen(false)
      setObservacoes('')
      setPeso('')
      setProximoRetorno('')
      carregarDados()
    } catch (err) {
      console.error('Erro ao registrar consulta:', err)
      alert('Erro ao salvar consulta no Neon.')
    } finally {
      setSalvando(false)
    }
  }

  // Verifica se está sem retorno há mais de 30 dias
  const ultimaConsulta = consultas[0]
  let diasSemConsulta = 0
  let isSemRetorno = false

  if (ultimaConsulta) {
    const dataUlt = new Date(ultimaConsulta.data_consulta + 'T12:00:00')
    const diffMs = new Date().getTime() - dataUlt.getTime()
    diasSemConsulta = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    const temRetornoFuturo = consultas.some((c) => {
      if (!c.proximo_retorno) return false
      return new Date(c.proximo_retorno + 'T23:59:59') >= new Date()
    })

    if (diasSemConsulta > 30 && !temRetornoFuturo) {
      isSemRetorno = true
    }
  }

  const idade = paciente?.data_nascimento ? calculateAge(paciente.data_nascimento) : null
  const imc = calculateImc(paciente?.peso_inicial, paciente?.altura)

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 py-8 animate-pulse max-w-6xl mx-auto">
          <div className="h-8 w-48 bg-slate-200 rounded-xl" />
          <div className="h-48 w-full bg-slate-200 rounded-3xl" />
          <div className="h-64 w-full bg-slate-200 rounded-3xl" />
        </div>
      </AppLayout>
    )
  }

  if (!paciente) {
    return (
      <AppLayout>
        <div className="text-center py-20 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-slate-800">Paciente não encontrado</h2>
          <p className="text-sm text-slate-500 mt-2">
            O paciente informado não existe ou não pertence à sua conta de nutricionista.
          </p>
          <Link to="/pacientes">
            <Button className="mt-5">Voltar para Pacientes</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-7 max-w-6xl mx-auto animate-fadeIn pb-12">
        {/* Navegação Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            to="/pacientes"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Lista de Pacientes</span>
          </Link>

          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="gap-2 shadow-sm shadow-emerald-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Consulta / Agendar Retorno</span>
          </Button>
        </div>

        {/* Card de Identificação do Paciente */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl shadow-md shadow-emerald-500/20">
                {paciente.nome.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {paciente.nome}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  {idade !== null && (
                    <span className="font-semibold text-slate-700">
                      {idade} anos {paciente.sexo ? `• ${paciente.sexo}` : ''}
                    </span>
                  )}
                  {paciente.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {paciente.email}
                    </span>
                  )}
                  {paciente.telefone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {paciente.telefone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status do Retorno */}
            {isSemRetorno ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold self-start sm:self-auto shadow-xs">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Sem retorno agendado (Há {diasSemConsulta} dias)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold self-start sm:self-auto shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Acompanhamento em dia</span>
              </div>
            )}
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Peso Inicial
              </span>
              <span className="text-lg font-black text-slate-900">
                {paciente.peso_inicial ? `${paciente.peso_inicial} kg` : '—'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Altura
              </span>
              <span className="text-lg font-black text-slate-900">
                {paciente.altura ? `${paciente.altura} cm` : '—'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                IMC Inicial
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-slate-900">
                  {imc ? imc.imc : '—'}
                </span>
                {imc && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${imc.bg} ${imc.color}`}>
                    {imc.label}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Próximo Retorno
              </span>
              <span className="text-lg font-black text-emerald-700">
                {ultimaConsulta?.proximo_retorno
                  ? formatDateBr(ultimaConsulta.proximo_retorno)
                  : 'Não agendado'}
              </span>
            </div>
          </div>
        </div>

        {/* Informações Clínicas & Hábitos (Anamnese) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Clínico */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-xl shadow-slate-200/40 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Perfil Clínico</h3>
            </div>

            <div className="space-y-4 text-xs">
              {/* Objetivos */}
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Objetivos
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {paciente.objetivos && paciente.objetivos.length > 0 ? (
                    paciente.objetivos.map((obj, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold"
                      >
                        {obj}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">Nenhum objetivo selecionado</span>
                  )}
                </div>
                {paciente.objetivo_texto && (
                  <p className="mt-1 text-slate-600 italic">"{paciente.objetivo_texto}"</p>
                )}
              </div>

              {/* Nível de atividade */}
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nível de Atividade Física
                </span>
                <span className="font-semibold text-slate-800">
                  {paciente.nivel_atividade || 'Não informado'}
                </span>
              </div>

              {/* Patologias */}
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Patologias / Condições
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {paciente.patologias && paciente.patologias.length > 0 ? (
                    paciente.patologias.map((pat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200/60 font-semibold"
                      >
                        {pat}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">Nenhuma patologia registrada</span>
                  )}
                </div>
              </div>

              {/* Restrições Alimentares */}
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Restrições Alimentares
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {paciente.restricoes_alimentares && paciente.restricoes_alimentares.length > 0 ? (
                    paciente.restricoes_alimentares.map((r, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/60 font-semibold"
                      >
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">Nenhuma restrição registrada</span>
                  )}
                </div>
              </div>

              {/* Alergias */}
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Alergias Alimentares
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {paciente.alergias && paciente.alergias.length > 0 ? (
                    paciente.alergias.map((al, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-900 border border-orange-200/60 font-semibold"
                      >
                        {al}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">Nenhuma alergia registrada</span>
                  )}
                </div>
              </div>

              {/* Medicamentos & Suplementos */}
              {(paciente.medicamentos || paciente.suplementos) && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {paciente.medicamentos && (
                    <p className="text-slate-700">
                      <strong>Medicamentos:</strong> {paciente.medicamentos}
                    </p>
                  )}
                  {paciente.suplementos && (
                    <p className="text-slate-700">
                      <strong>Suplementos:</strong> {paciente.suplementos}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card Hábitos */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-xl shadow-slate-200/40 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hábitos & Rotina</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Refeições / Dia
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {paciente.refeicoes_por_dia || '—'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Consumo de Água
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {paciente.litros_agua ? `${paciente.litros_agua} litros` : '—'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Acorda
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {paciente.horario_acorda || '—'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Dorme
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {paciente.horario_dorme || '—'}
                  </span>
                </div>
              </div>

              {/* Atividade física */}
              <div className="pt-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Exercícios Físicos
                </span>
                <span className="font-semibold text-slate-800">
                  {paciente.atividade_fisica ? 'Sim' : 'Não'}
                </span>
                {paciente.atividade_fisica_descricao && (
                  <p className="mt-1 text-slate-600">
                    {paciente.atividade_fisica_descricao}
                  </p>
                )}
              </div>

              {/* Observações gerais */}
              {paciente.observacoes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Observações Gerais
                  </span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {paciente.observacoes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Histórico de Consultas */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Histórico de Consultas</h3>
              <p className="text-xs text-slate-500">Acompanhamento e evolução dos atendimentos</p>
            </div>

            <Button onClick={() => setModalOpen(true)} size="sm" variant="secondary" className="gap-1.5">
              <Plus className="h-4 w-4" /> Nova Consulta
            </Button>
          </div>

          {consultas.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Nenhuma consulta registrada para este paciente ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {consultas.map((c) => {
                const dataFormatada = formatDateBr(c.data_consulta)

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold text-slate-900 text-sm">
                          Consulta realizada em {dataFormatada}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {c.peso && (
                          <span className="font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                            Peso: {c.peso} kg
                          </span>
                        )}
                        {c.proximo_retorno && (
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            Retorno: {formatDateBr(c.proximo_retorno)}
                          </span>
                        )}
                      </div>
                    </div>

                    {c.observacoes && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong>Observações:</strong> {c.observacoes}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal de Agendar Retorno / Consulta */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setModalOpen(false)}
            />
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Registrar Consulta / Retorno</h3>
                  <p className="text-xs text-slate-500">Paciente: {paciente.nome}</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSalvarConsulta} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Data da Consulta *"
                    type="date"
                    value={dataConsulta}
                    onChange={(e) => setDataConsulta(e.target.value)}
                    required
                  />

                  <Input
                    label="Próximo Retorno"
                    type="date"
                    value={proximoRetorno}
                    onChange={(e) => setProximoRetorno(e.target.value)}
                    helperText="Ao agendar retorno, o paciente sai de 'sem retorno'"
                  />
                </div>

                <Input
                  label="Peso Atual (kg)"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 68.5"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                />

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Observações Clínicas
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Evolução, adesão à dieta, novas metas..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                    disabled={salvando}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" loading={salvando}>
                    Salvar Consulta
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
