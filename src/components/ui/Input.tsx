import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, showPasswordToggle, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type

    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full text-left space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={actualType}
            className={cn(
              'flex h-11 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-150',
              'border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xs',
              leftIcon && 'pl-10',
              (isPassword && showPasswordToggle) && 'pr-11',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10',
              className
            )}
            {...props}
          />
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-600 font-medium pl-0.5 animate-fadeIn">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 pl-0.5">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'

