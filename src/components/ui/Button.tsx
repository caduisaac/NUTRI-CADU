import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]'

    const variants = {
      default:
        'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/20 hover:shadow-emerald-600/30 font-semibold',
      secondary:
        'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 font-semibold',
      outline:
        'border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-700 shadow-xs',
      ghost:
        'hover:bg-slate-100 hover:text-slate-900 text-slate-600',
      destructive:
        'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20',
    }

    const sizes = {
      default: 'h-11 px-5 py-2.5',
      sm: 'h-9 rounded-lg px-3.5 text-xs',
      lg: 'h-12 rounded-xl px-7 text-base font-semibold',
      icon: 'h-10 w-10',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

