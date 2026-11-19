export function formatPhone(val: string): string {
  if (!val) return ''
  const digits = val.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export function calculateAge(birthDateStr?: string | null): number | null {
  if (!birthDateStr) return null
  const today = new Date()
  const birthDate = new Date(birthDateStr + 'T12:00:00')
  if (isNaN(birthDate.getTime())) return null

  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

export function formatTimeInput(input: string | number): string {
  if (input === undefined || input === null || input === '') return ''
  const clean = String(input).replace(/[^0-9]/g, '')
  if (!clean) return ''

  if (clean.length === 1) return `0${clean}:00`
  if (clean.length === 2) {
    const n = parseInt(clean, 10)
    if (n <= 24) return `${clean.padStart(2, '0')}:00`
    return `0${clean[0]}:${clean[1]}0`
  }
  if (clean.length === 3) {
    return `0${clean[0]}:${clean.slice(1, 3)}`
  }
  return `${clean.slice(0, 2)}:${clean.slice(2, 4)}`
}

export interface ImcResult {
  imc: number
  label: string
  color: string
  bg: string
}

export function calculateImc(pesoKg?: number | null, alturaCm?: number | null): ImcResult | null {
  if (!pesoKg || !alturaCm || pesoKg <= 0 || alturaCm <= 0) return null

  const alturaMetros = alturaCm / 100
  const imc = parseFloat((pesoKg / (alturaMetros * alturaMetros)).toFixed(1))

  if (imc < 18.5) {
    return {
      imc,
      label: 'Abaixo do peso',
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
    }
  }
  if (imc <= 24.9) {
    return {
      imc,
      label: 'Peso ideal / Normal',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    }
  }
  if (imc <= 29.9) {
    return {
      imc,
      label: 'Sobrepeso',
      color: 'text-amber-800',
      bg: 'bg-amber-100/70 border-amber-300',
    }
  }
  if (imc <= 34.9) {
    return {
      imc,
      label: 'Obesidade Grau I',
      color: 'text-orange-800',
      bg: 'bg-orange-50 border-orange-200',
    }
  }
  if (imc <= 39.9) {
    return {
      imc,
      label: 'Obesidade Grau II',
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
    }
  }
  return {
    imc,
    label: 'Obesidade Grau III',
    color: 'text-red-800',
    bg: 'bg-red-100 border-red-300',
  }
}

export function formatDateBr(dateStr?: string | null): string {
  if (!dateStr) return 'Não informada'
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'))
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

