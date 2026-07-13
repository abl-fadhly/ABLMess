import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-secondary-500 shadow-sm shadow-primary-600/25',
  secondary:
    'bg-surface text-neutral-700 border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 focus-visible:ring-secondary-500',
  danger:
    'bg-surface text-error-dark border border-error-default/30 hover:bg-error-light active:bg-error-light focus-visible:ring-error-default',
  ghost: 'text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-secondary-500',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
}

export function LinkButton({
  tone = 'default',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'default' | 'danger' | 'success' | 'info' }) {
  const toneClasses = {
    default: 'text-secondary-700 hover:text-secondary-800',
    danger: 'text-error-dark hover:opacity-80',
    success: 'text-success-dark hover:opacity-80',
    info: 'text-info-dark hover:opacity-80',
  }[tone]
  return (
    <button
      className={`text-sm font-medium underline-offset-2 hover:underline decoration-1 transition-colors disabled:opacity-50 disabled:pointer-events-none ${toneClasses} ${className}`}
      {...props}
    />
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const { className = '', error, id, ...rest } = props
  const errorId = error && id ? `${id}-error` : undefined
  return (
    <div>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-secondary-500/40 focus:border-secondary-500 ${
          error ? 'border-error-default focus:ring-error-default/30 focus:border-error-default' : 'border-neutral-300'
        } ${className}`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-error-dark">
          {error}
        </p>
      )}
    </div>
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  const { className = '', children, error, id, ...rest } = props
  const errorId = error && id ? `${id}-error` : undefined
  return (
    <div>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-neutral-900 transition-shadow focus:outline-none focus:ring-2 focus:ring-secondary-500/40 focus:border-secondary-500 ${
          error ? 'border-error-default focus:ring-error-default/30 focus:border-error-default' : 'border-neutral-300'
        } ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-error-dark">
          {error}
        </p>
      )}
    </div>
  )
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">
      {children}
    </label>
  )
}

export function Card({
  title,
  action,
  className = '',
  interactive = false,
  children,
}: {
  title?: string
  action?: ReactNode
  className?: string
  interactive?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={`bg-surface border border-neutral-200/80 rounded-xl shadow-sm shadow-neutral-200/40 dark:shadow-black/20 p-5 sm:p-6 transition-all duration-200 ${
        interactive
          ? 'hover:shadow-md hover:shadow-neutral-300/40 dark:hover:shadow-black/30 hover:-translate-y-0.5 hover:border-secondary-200 dark:hover:border-secondary-700 cursor-pointer'
          : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="font-semibold text-neutral-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

const badgeTones: Record<string, { pill: string; dot: string }> = {
  warning: { pill: 'bg-warning-light text-warning-dark ring-1 ring-inset ring-warning-default/30', dot: 'bg-warning-default' },
  success: { pill: 'bg-success-light text-success-dark ring-1 ring-inset ring-success-default/30', dot: 'bg-success-default' },
  info: { pill: 'bg-info-light text-info-dark ring-1 ring-inset ring-info-default/30', dot: 'bg-info-default' },
  error: { pill: 'bg-error-light text-error-dark ring-1 ring-inset ring-error-default/30', dot: 'bg-error-default' },
  neutral: { pill: 'bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-200', dot: 'bg-neutral-400' },
  primary: {
    pill: 'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-200 dark:bg-primary-900/40 dark:text-primary-300 dark:ring-primary-800/60',
    dot: 'bg-primary-500',
  },
  secondary: {
    pill: 'bg-secondary-50 text-secondary-700 ring-1 ring-inset ring-secondary-200 dark:bg-secondary-900/40 dark:text-secondary-300 dark:ring-secondary-800/60',
    dot: 'bg-secondary-500',
  },
}

export function Badge({ tone, children }: { tone: keyof typeof badgeTones; children: ReactNode }) {
  const t = badgeTones[tone]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${t.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
      {children}
    </span>
  )
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-5 sm:-mx-6">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  )
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th className="text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 px-5 sm:px-6 py-2.5 border-b border-neutral-200">
      {children}
    </th>
  )
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-5 sm:px-6 py-3.5 text-neutral-700 ${className}`}>{children}</td>
}

export function Tr({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80 transition-colors">{children}</tr>
  )
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose?: () => void
  children: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-20 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl shadow-neutral-900/15 dark:shadow-black/40 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-neutral-900 text-lg tracking-tight">{title}</h2>
        {children}
      </div>
    </div>
  )
}
