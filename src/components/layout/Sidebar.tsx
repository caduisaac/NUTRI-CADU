import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Logo } from '@/components/ui/Logo'

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const navItems = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: 'Pacientes',
      to: '/pacientes',
      icon: <Users className="h-5 w-5" />,
    },
  ]

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-6 border-r border-slate-200/80">
      <div className="space-y-6">
        {/* Topo: Logotipo NUTRI CADU */}
        <div className="px-2">
          <NavLink to="/dashboard" className="block focus:outline-none">
            <Logo size="md" showSubtitle={true} />
          </NavLink>
        </div>

        {/* Separador sutil */}
        <div className="h-px bg-slate-100 mx-2" />

        {/* Menu de Navegação */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Navegação Principal
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Rodapé: Perfil da Nutricionista & Logout */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-xs">
            {(user?.name || 'N').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900 leading-tight">
              {user?.name || 'Nutricionista'}
            </p>
            <p className="truncate text-[11px] text-slate-500 leading-tight">
              {user?.email || ''}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-600 transition-colors" />
            <span>Encerrar Sessão</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />
        </button>

        <div className="px-2 pt-1 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>Neon Database Conectado</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Barra superior Mobile */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white px-4 md:hidden">
        <Logo size="sm" showSubtitle={false} />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Alternar menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Drawer Mobile com Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-white z-10 shadow-2xl">
            {navContent}
          </div>
        </div>
      )}

      {/* Sidebar Fixo Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 md:block">
        {navContent}
      </aside>
    </>
  )
}

