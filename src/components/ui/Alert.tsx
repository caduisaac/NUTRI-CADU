import React from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertProps {
  variant?: 'error' | 'success' | 'info' | 'warning'
  title?: string
  message: string
  onClose?: () => void
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'error',
  title,
  message,
  onClose,
  className,
}) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  }

  const icons = {
    error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
  }

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-2xl border p-4 text-sm transition-all shadow-xs',
        styles[variant],
        className
      )}
      role="alert"
    >
      {icons[variant]}
      <div className="flex-1 text-left">
        {title && <h5 className="font-semibold leading-none tracking-tight mb-1">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-95">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-md"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

