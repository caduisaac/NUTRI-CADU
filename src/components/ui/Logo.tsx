import React from 'react'
import { Activity } from 'lucide-react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-2.5 shadow-md shadow-emerald-500/20 text-white">
          <Activity className={`${iconSizes[size]} stroke-[2.5]`} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
        <div className="flex flex-col text-left">
          <span className={`font-extrabold tracking-tight text-slate-900 ${textSizes[size]}`}>
            NUTRI <span className="text-emerald-600">CADU</span>
          </span>
          {showSubtitle && (
            <span className="text-[11px] font-medium uppercase tracking-widest text-emerald-700/80 -mt-1">
              Gestão Nutricional
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

