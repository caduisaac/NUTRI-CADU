import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  Calendar,
  Phone,
  Mail,
  Activity,
  Heart,
  Scale,
  Ruler,
  AlertCircle,
  Check,
  CheckCircle2,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Clock,
  Droplets,
  Utensils,
  Moon,
  Sun,
  Dumbbell,
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { neonClient } from '@/lib/neon'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import {
  formatPhone,
  calculateAge,
  formatTimeInput,
  calculateImc
} from '@/lib/formatters'

export const NovoPaciente: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Aba ativa: 'pessoal' | 'clinico' | 'habitos'
  const [activeTab, setActiveTab] = useState<'pessoal' | 'clinico' | 'habitos'>('pessoal')
  const [salvando, setSalvando] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successToast, setSuccessToast] = useState(false)

  // -------------------------------------------------------------
  // ABA 1 — PESSOAL
  // -------------------------------------------------------------
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [sexo, setSexo] = useState<'Feminino' | 'Masculino' | 'Outro' | ''>('')
  const [telefone, setTelefone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')

  // -------------------------------------------------------------
  // ABA 2 — CLÍNICO
  // -------------------------------------------------------------
  const [peso, setPeso] = useState<string>('')
  const [altura, setAltura] = useState<string>('')

  // Objetivos (múltipla escolha + campo livre)
  const opcoesObjetivos = [
    'Emagrecer',
    'Ganhar massa',
    'Controlar diabetes',
    'Saúde geral',
    'Performance esportiva',
    'Reeducação alimentar',
  ]
  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([])
  const [objetivoTextoLivre, setObjetivoTextoLivre] = useState('')

  // Nível de atividade física (seleção única)
  const opcoesAtividade = [
    'Sedentário',
    'Levemente ativo',
    'Moderadamente ativo',
    'Muito ativo',
    'Extremamente ativo',
  ]
  const [nivelAtividade, setNivelAtividade] = useState<string>('')

  // Patologias (múltipla escolha + "Nenhum" + campo livre)
  const opcoesPatologias = [
    'Diabetes',
    'Hipertensão',
    'Hipotireoidismo',
    'Hipertireoidismo',
    'Síndrome do ovário policístico',
    'Doença celíaca',
    'Colesterol alto',
  ]
  const [patologiasSelecionadas, setPatologiasSelecionadas] = useState<string[]>([])
  const [customPatologia, setCustomPatologia] = useState('')

  // Restrições alimentares (múltipla escolha + "Nenhum" + campo livre)
  const opcoesRestricoes = [
    'Lactose',
    'Glúten',
    'Açúcar',
    'Carne vermelha',
    'Frutos do mar',
  ]
  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState<string[]>([])
  const [customRestricao, setCustomRestricao] = useState('')

  // Alergias alimentares (múltipla escolha + "Nenhum" + campo livre)
  const opcoesAlergias = [
    'Amendoim',
    'Leite',
    'Ovo',
    'Soja',
    'Trigo',
    'Frutos do mar',
  ]
  const [alergiasSelecionadas, setAlergiasSelecionadas] = useState<string[]>([])
  const [customAlergia, setCustomAlergia] = useState('')

  // Medicamentos & Suplementos
  const [medicamentos, setMedicamentos] = useState('')
  const [suplementos, setSuplementos] = useState('')

  // -------------------------------------------------------------
  // ABA 3 — HÁBITOS
  // -------------------------------------------------------------
  const [refeicoesPorDia, setRefeicoesPorDia] = useState<string>('')
  const [horarioAcorda, setHorarioAcorda] = useState('')
  const [horarioDorme, setHorarioDorme] = useState('')
  const [litrosAgua, setLitrosAgua] = useState<string>('')
  const [praticaAtividade, setPraticaAtividade] = useState<boolean | null>(null)
  const [atividadeDescricao, setAtividadeDescricao] = useState('')
  const [observacoesGerais, setObservacoesGerais] = useState('')

  // Cálculos dinâmicos
  const idadeCalculada = calculateAge(dataNascimento)
  const pesoNum = peso ? parseFloat(peso) : null
  const alturaNum = altura ? parseFloat(altura) : null
  const imcCalculado = calculateImc(pesoNum, alturaNum)

  // Handlers para seleção múltipla com suporte a "Nenhum"
  const toggleMultiSelect = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (item === 'Nenhum') {
      if (list.includes('Nenhum')) {
        setList([])
      } else {
        setList(['Nenhum'])
      }
      return
    }

    const withoutNenhum = list.filter((i) => i !== 'Nenhum')
    if (withoutNenhum.includes(item)) {
      setList(withoutNenhum.filter((i) => i !== item))
    } else {
      setList([...withoutNenhum, item])
    }
  }

  const addCustomItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
    setValue: (val: string) => void
  ) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const withoutNenhum = list.filter((i) => i !== 'Nenhum')
    if (!withoutNenhum.includes(trimmed)) {
      setList([...withoutNenhum, trimmed])
    }
    setValue('')
  }

  // Copiar telefone para whatsapp
  const copiarTelefoneParaWhats = () => {
    if (telefone) {
      setWhatsapp(telefone)
    }
  }

  // Submit do Formulário
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMessage(null)

    // Regra: O único campo obrigatório é o nome completo
    if (!nome.trim()) {
      setActiveTab('pessoal')
      setErrorMessage('Por favor, informe o nome completo do paciente.')
      return
    }

    if (!user) {
      setErrorMessage('Sessão expirada. Faça login novamente.')
      return
    }

    setSalvando(true)

    try {
      // Monta objeto com todos os campos mapeados para a tabela 'pacientes' do Neon
      const payload: Record<string, any> = {
        nutricionista_id: user.id,
        nome: nome.trim(),
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        telefone: telefone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
        peso_inicial: pesoNum,
        altura: alturaNum,
        objetivos: objetivosSelecionados.length > 0 ? objetivosSelecionados : null,
        objetivo_texto: objetivoTextoLivre.trim() || null,
        nivel_atividade: nivelAtividade || null,
        patologias: patologiasSelecionadas.length > 0 ? patologiasSelecionadas : null,
        restricoes_alimentares: restricoesSelecionadas.length > 0 ? restricoesSelecionadas : null,
        alergias: alergiasSelecionadas.length > 0 ? alergiasSelecionadas : null,
        medicamentos: medicamentos.trim() || null,
        suplementos: suplementos.trim() || null,
        refeicoes_por_dia: refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null,
        horario_acorda: horarioAcorda.trim() || null,
        horario_dorme: horarioDorme.trim() || null,
        litros_agua: litrosAgua ? parseFloat(litrosAgua) : null,
        atividade_fisica: praticaAtividade,
        atividade_fisica_descricao: praticaAtividade ? atividadeDescricao.trim() || null : null,
        observacoes: observacoesGerais.trim() || null,
      }

      const { data, error: insertError } = await neonClient
        .from('pacientes')
        .insert(payload)
        .select()

      if (insertError) throw insertError

      const novoPaciente = data?.[0]
      if (!novoPaciente?.id) {
        throw new Error('Não foi possível recuperar o ID do paciente recém-criado.')
      }

      // Se houver peso e altura, opcionalmente já cria uma consulta inicial de avaliação
      if (pesoNum) {
        try {
          await neonClient.from('consultas').insert({
            paciente_id: novoPaciente.id,
            data_consulta: new Date().toISOString().split('T')[0],
            peso: pesoNum,
            observacoes: 'Consulta e avaliação inicial de cadastro',
          })
        } catch (consErr) {
          console.warn('Nota: Consulta inicial automática:', consErr)
        }
      }

      setSuccessToast(true)

      // Regra: Redirecionar para o perfil do paciente recém cadastrado
      setTimeout(() => {
        navigate(`/pacientes/${novoPaciente.id}`, { replace: true })
      }, 700)
    } catch (err: any) {
      console.error('Erro ao cadastrar paciente no Neon:', err)
      setErrorMessage(
        err.message || 'Erro ao salvar paciente no banco de dados. Tente novamente.'
      )
      setSalvando(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn pb-12">
        {/* Breadcrumb e Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <Link
              to="/pacientes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Lista de Pacientes</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Cadastrar Novo Paciente
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Preencha os dados da anamnese inicial. Somente o <strong>nome completo</strong> é obrigatório.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/pacientes">
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
            </Link>
            <Button
              onClick={() => handleSubmit()}
              loading={salvando}
              className="gap-2 shadow-sm shadow-emerald-600/20"
            >
              <Check className="h-4 w-4" />
              <span>Salvar Paciente</span>
            </Button>
          </div>
        </div>

        {/* Mensagem de Erro Geral */}
        {errorMessage && (
          <Alert
            variant="error"
            title="Erro no formulário"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}

        {/* Notificação de Sucesso */}
        {successToast && (
          <Alert
            variant="success"
            title="Paciente cadastrado com sucesso!"
            message="Dados salvos no Neon Database. Redirecionando para o perfil..."
          />
        )}

        {/* -------------------------------------------------------------
            NAVEGAÇÃO DAS 3 ABAS (PESSOAL, CLÍNICO, HÁBITOS)
            ------------------------------------------------------------- */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('pessoal')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'pessoal'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <User className="h-4 w-4 text-emerald-600" />
            <span>1. Pessoal</span>
            {nome.trim() && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinico')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'clinico'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Heart className="h-4 w-4 text-emerald-600" />
            <span>2. Clínico</span>
            {(peso || altura || objetivosSelecionados.length > 0) && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habitos')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'habitos'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Activity className="h-4 w-4 text-emerald-600" />
            <span>3. Hábitos</span>
            {(refeicoesPorDia || litrosAgua) && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        {/* -------------------------------------------------------------
            CONTEÚDO DAS ABAS
            ------------------------------------------------------------- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* =========================================================
              ABA 1 — PESSOAL
              ========================================================= */}
          {activeTab === 'pessoal' && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Identificação Pessoal
                </h3>
                <p className="text-xs text-slate-500">
                  Dados cadastrais e meios de contato do paciente
                </p>
              </div>

              <div className="space-y-5">
                {/* Nome Completo (Obrigatório) */}
                <Input
                  label="Nome Completo *"
                  type="text"
                  placeholder="Ex: Maria Carolina da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  leftIcon={<User className="h-4 w-4" />}
                  required
                  autoFocus
                  helperText="Este é o único campo obrigatório do cadastro."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Data de Nascimento com cálculo de idade automático */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Data de Nascimento
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                      />
                    </div>
                    {idadeCalculada !== null && (
                      <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
                        <Check className="h-3.5 w-3.5" />
                        Idade calculada: {idadeCalculada} {idadeCalculada === 1 ? 'ano' : 'anos'}
                      </p>
                    )}
                  </div>

                  {/* Sexo (Seleção única: Feminino, Masculino, Outro) */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Sexo Biológico
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Feminino', 'Masculino', 'Outro'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSexo(s)}
                          className={`h-11 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                            sexo === s
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Telefone */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Telefone
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="(11) 98765-4321"
                        value={telefone}
                        onChange={(e) => setTelefone(formatPhone(e.target.value))}
                        className="flex h-11 w-full pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* WhatsApp com botão de copiar */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        WhatsApp
                      </label>
                      {telefone && (
                        <button
                          type="button"
                          onClick={copiarTelefoneParaWhats}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Mesmo do telefone
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <Phone className="pointer-events-none absolute left-3.5 h-4 w-4 text-emerald-600" />
                      <input
                        type="tel"
                        placeholder="(11) 98765-4321"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                        className="flex h-11 w-full pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* E-mail */}
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="paciente@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setActiveTab('clinico')}
                  className="gap-2"
                >
                  <span>Avançar para Clínico</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* =========================================================
              ABA 2 — CLÍNICO
              ========================================================= */}
          {activeTab === 'clinico' && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-7">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-emerald-600" />
                  Perfil Clínico & Antropometria
                </h3>
                <p className="text-xs text-slate-500">
                  Medidas corporais, histórico de saúde e objetivos nutricionais
                </p>
              </div>

              {/* Medidas: Peso, Altura e IMC calculado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
                {/* Peso */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Peso Atual
                  </label>
                  <div className="relative flex items-center">
                    <Scale className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.0"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                      className="flex h-11 w-full pl-10 pr-12 rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                    />
                    <span className="pointer-events-none absolute right-3.5 text-xs font-bold text-slate-400">
                      kg
                    </span>
                  </div>
                </div>

                {/* Altura */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Altura
                  </label>
                  <div className="relative flex items-center">
                    <Ruler className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Ex: 172"
                      value={altura}
                      onChange={(e) => setAltura(e.target.value)}
                      className="flex h-11 w-full pl-10 pr-12 rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                    />
                    <span className="pointer-events-none absolute right-3.5 text-xs font-bold text-slate-400">
                      cm
                    </span>
                  </div>
                </div>

                {/* IMC Calculado (Somente Leitura) */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    IMC (Automático)
                  </label>
                  <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2">
                    <span className="text-sm font-black text-slate-900">
                      {imcCalculado ? imcCalculado.imc : '—'}
                    </span>
                    {imcCalculado ? (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border ${imcCalculado.bg} ${imcCalculado.color}`}
                      >
                        {imcCalculado.label}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Aguardando peso/altura</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Objetivos */}
              <div className="space-y-2.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Objetivo Principal (Múltipla Escolha)
                </label>
                <div className="flex flex-wrap gap-2">
                  {opcoesObjetivos.map((obj) => {
                    const sel = objetivosSelecionados.includes(obj)
                    return (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => {
                          if (sel) {
                            setObjetivosSelecionados(objetivosSelecionados.filter((o) => o !== obj))
                          } else {
                            setObjetivosSelecionados([...objetivosSelecionados, obj])
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                          sel
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {sel && <Check className="h-3.5 w-3.5" />}
                        {obj}
                      </button>
                    )
                  })}
                </div>
                <Input
                  placeholder="Outro objetivo ou observação específica (opcional)..."
                  value={objetivoTextoLivre}
                  onChange={(e) => setObjetivoTextoLivre(e.target.value)}
                />
              </div>

              {/* Nível de Atividade Física */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Nível de Atividade Física (Seleção Única)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {opcoesAtividade.map((ativ) => {
                    const sel = nivelAtividade === ativ
                    return (
                      <button
                        key={ativ}
                        type="button"
                        onClick={() => setNivelAtividade(ativ)}
                        className={`p-3 rounded-xl text-xs font-bold text-center transition-all border ${
                          sel
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {ativ}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Patologias ou Condições de Saúde */}
              <div className="space-y-2.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Patologias ou Condições de Saúde
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      toggleMultiSelect(
                        patologiasSelecionadas,
                        setPatologiasSelecionadas,
                        'Nenhum'
                      )
                    }
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      patologiasSelecionadas.includes('Nenhum')
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Nenhum
                  </button>
                  {opcoesPatologias.map((pat) => {
                    const sel = patologiasSelecionadas.includes(pat)
                    return (
                      <button
                        key={pat}
                        type="button"
                        onClick={() =>
                          toggleMultiSelect(
                            patologiasSelecionadas,
                            setPatologiasSelecionadas,
                            pat
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                          sel
                            ? 'bg-red-50 text-red-800 border-red-300 shadow-xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {sel && <Check className="h-3.5 w-3.5 text-red-600" />}
                        {pat}
                      </button>
                    )
                  })}
                </div>
                {/* Adicionar patologia livremente */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar outra patologia..."
                    value={customPatologia}
                    onChange={(e) => setCustomPatologia(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomItem(
                          patologiasSelecionadas,
                          setPatologiasSelecionadas,
                          customPatologia,
                          setCustomPatologia
                        )
                      }
                    }}
                    className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addCustomItem(
                        patologiasSelecionadas,
                        setPatologiasSelecionadas,
                        customPatologia,
                        setCustomPatologia
                      )
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Adicionar
                  </Button>
                </div>
              </div>

              {/* Restrições Alimentares */}
              <div className="space-y-2.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Restrições Alimentares
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      toggleMultiSelect(
                        restricoesSelecionadas,
                        setRestricoesSelecionadas,
                        'Nenhum'
                      )
                    }
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      restricoesSelecionadas.includes('Nenhum')
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Nenhum
                  </button>
                  {opcoesRestricoes.map((rest) => {
                    const sel = restricoesSelecionadas.includes(rest)
                    return (
                      <button
                        key={rest}
                        type="button"
                        onClick={() =>
                          toggleMultiSelect(
                            restricoesSelecionadas,
                            setRestricoesSelecionadas,
                            rest
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                          sel
                            ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {sel && <Check className="h-3.5 w-3.5 text-amber-600" />}
                        {rest}
                      </button>
                    )
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar outra restrição alimentar..."
                    value={customRestricao}
                    onChange={(e) => setCustomRestricao(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomItem(
                          restricoesSelecionadas,
                          setRestricoesSelecionadas,
                          customRestricao,
                          setCustomRestricao
                        )
                      }
                    }}
                    className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addCustomItem(
                        restricoesSelecionadas,
                        setRestricoesSelecionadas,
                        customRestricao,
                        setCustomRestricao
                      )
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Adicionar
                  </Button>
                </div>
              </div>

              {/* Alergias Alimentares */}
              <div className="space-y-2.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Alergias Alimentares
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      toggleMultiSelect(
                        alergiasSelecionadas,
                        setAlergiasSelecionadas,
                        'Nenhum'
                      )
                    }
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      alergiasSelecionadas.includes('Nenhum')
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Nenhum
                  </button>
                  {opcoesAlergias.map((al) => {
                    const sel = alergiasSelecionadas.includes(al)
                    return (
                      <button
                        key={al}
                        type="button"
                        onClick={() =>
                          toggleMultiSelect(
                            alergiasSelecionadas,
                            setAlergiasSelecionadas,
                            al
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                          sel
                            ? 'bg-orange-50 text-orange-900 border-orange-300 shadow-xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {sel && <Check className="h-3.5 w-3.5 text-orange-600" />}
                        {al}
                      </button>
                    )
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar outra alergia alimentar..."
                    value={customAlergia}
                    onChange={(e) => setCustomAlergia(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomItem(
                          alergiasSelecionadas,
                          setAlergiasSelecionadas,
                          customAlergia,
                          setCustomAlergia
                        )
                      }
                    }}
                    className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addCustomItem(
                        alergiasSelecionadas,
                        setAlergiasSelecionadas,
                        customAlergia,
                        setCustomAlergia
                      )
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Adicionar
                  </Button>
                </div>
              </div>

              {/* Medicamentos & Suplementos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Medicamentos Contínuos
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Losartana 50mg, Levotiroxina 75mcg..."
                    value={medicamentos}
                    onChange={(e) => setMedicamentos(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Suplementos em Uso
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Creatina 5g, Whey Protein, Ômega 3..."
                    value={suplementos}
                    onChange={(e) => setSuplementos(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('pessoal')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar para Pessoal</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => setActiveTab('habitos')}
                  className="gap-2"
                >
                  <span>Avançar para Hábitos</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* =========================================================
              ABA 3 — HÁBITOS
              ========================================================= */}
          {activeTab === 'habitos' && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  Rotina Diária e Estilo de Vida
                </h3>
                <p className="text-xs text-slate-500">
                  Horários, hidratação, sono e prática de exercícios
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Refeições por dia */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Refeições / Dia
                  </label>
                  <div className="relative flex items-center">
                    <Utensils className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      placeholder="Ex: 4"
                      value={refeicoesPorDia}
                      onChange={(e) => setRefeicoesPorDia(e.target.value)}
                      className="flex h-11 w-full pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                    />
                  </div>
                </div>

                {/* Horário que acorda */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Horário que Acorda
                  </label>
                  <div className="relative flex items-center">
                    <Sun className="pointer-events-none absolute left-3.5 h-4 w-4 text-amber-500" />
                    <input
                      type="text"
                      placeholder="Ex: 630 → 06:30"
                      value={horarioAcorda}
                      onChange={(e) => setHorarioAcorda(e.target.value)}
                      onBlur={() => setHorarioAcorda(formatTimeInput(horarioAcorda))}
                      className="flex h-11 w-full pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">Ex: 6 → 06:00, 630 → 06:30</span>
                </div>

                {/* Horário que dorme */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Horário que Dorme
                  </label>
                  <div className="relative flex items-center">
                    <Moon className="pointer-events-none absolute left-3.5 h-4 w-4 text-indigo-500" />
                    <input
                      type="text"
                      placeholder="Ex: 2230 → 22:30"
                      value={horarioDorme}
                      onChange={(e) => setHorarioDorme(e.target.value)}
                      onBlur={() => setHorarioDorme(formatTimeInput(horarioDorme))}
                      className="flex h-11 w-full pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">Ex: 23 → 23:00, 2230 → 22:30</span>
                </div>

                {/* Quantidade de água por dia */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Consumo de Água
                  </label>
                  <div className="relative flex items-center">
                    <Droplets className="pointer-events-none absolute left-3.5 h-4 w-4 text-blue-500" />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Ex: 2.5"
                      value={litrosAgua}
                      onChange={(e) => setLitrosAgua(e.target.value)}
                      className="flex h-11 w-full pl-10 pr-14 rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                    />
                    <span className="pointer-events-none absolute right-3 text-xs font-bold text-slate-400">
                      litros
                    </span>
                  </div>
                </div>
              </div>

              {/* Pratica Atividade Física */}
              <div className="space-y-3 p-5 rounded-2xl bg-slate-50/80 border border-slate-100 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Pratica atividade física regularmente?
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPraticaAtividade(true)}
                    className={`h-11 px-6 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      praticaAtividade === true
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPraticaAtividade(false)
                      setAtividadeDescricao('')
                    }}
                    className={`h-11 px-6 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      praticaAtividade === false
                        ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Não
                  </button>
                </div>

                {praticaAtividade === true && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Qual atividade e frequência semanal?
                    </label>
                    <div className="relative flex items-center">
                      <Dumbbell className="pointer-events-none absolute left-3.5 h-4 w-4 text-emerald-600" />
                      <input
                        type="text"
                        placeholder="Ex: Musculação 4x na semana + corrida aos domingos"
                        value={atividadeDescricao}
                        onChange={(e) => setAtividadeDescricao(e.target.value)}
                        className="flex h-11 w-full pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Observações Gerais */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Observações Gerais
                </label>
                <textarea
                  rows={4}
                  placeholder="Informações adicionais, preferências alimentares, histórico familiar ou anotações clínicas..."
                  value={observacoesGerais}
                  onChange={(e) => setObservacoesGerais(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('clinico')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar para Clínico</span>
                </Button>

                <Button
                  type="submit"
                  loading={salvando}
                  className="gap-2 shadow-lg shadow-emerald-600/25 px-8"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Finalizar e Salvar Paciente</span>
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </AppLayout>
  )
}

