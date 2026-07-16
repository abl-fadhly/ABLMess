import { useEffect, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { Icon, iconPaths } from './icons'

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

export function CardLink({ to, className = '', children }: { to: string; className?: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium text-secondary-700 hover:text-secondary-800 hover:underline underline-offset-2 ${className}`}
    >
      {children}
    </Link>
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
  title?: ReactNode
  action?: ReactNode
  className?: string
  interactive?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={`bg-surface border border-neutral-200/80 rounded-xl shadow-sm shadow-neutral-200/40 p-6 sm:p-7 transition-all duration-200 ${
        interactive
          ? 'hover:shadow-md hover:shadow-neutral-300/40 hover:-translate-y-0.5 hover:border-secondary-200 cursor-pointer'
          : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-5 gap-2">
          {title && (
            <h2 className="text-base font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

const iconCircleTones: Record<'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary', string> = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success-light text-success-dark',
  warning: 'bg-warning-light text-warning-dark',
  error: 'bg-error-light text-error-dark',
  info: 'bg-info-light text-info-dark',
  secondary: 'bg-secondary-50 text-secondary-700',
}

export function IconCircle({
  tone = 'primary',
  size = 'md',
  children,
}: {
  tone?: keyof typeof iconCircleTones
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}) {
  const sizeClasses = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' }[size]
  return (
    <div className={`${sizeClasses} rounded-full flex items-center justify-center shrink-0 ${iconCircleTones[tone]}`}>
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
    pill: 'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-200',
    dot: 'bg-primary-500',
  },
  secondary: {
    pill: 'bg-secondary-50 text-secondary-700 ring-1 ring-inset ring-secondary-200',
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

export function Chip({
  active,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-secondary-600 text-white'
          : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
      } ${className}`}
      {...props}
    />
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

const avatarSizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
}

export function Avatar({
  name,
  photoUrl,
  size = 'md',
  className = '',
}: {
  name: string
  photoUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${avatarSizeClasses[size]} rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${avatarSizeClasses[size]} rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center font-semibold shrink-0 ${className}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

const progressToneClasses: Record<'primary' | 'success' | 'warning' | 'error', string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-default',
  warning: 'bg-warning-default',
  error: 'bg-error-default',
}

export function ProgressBar({
  value,
  max,
  tone = 'primary',
  className = '',
}: {
  value: number
  max: number
  tone?: 'primary' | 'success' | 'warning' | 'error'
  className?: string
}) {
  const percent = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`h-2 w-full rounded-full bg-neutral-100 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${progressToneClasses[tone]}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export function StatTile({
  label,
  value,
  sublabel,
  icon,
  tone = 'primary',
}: {
  label: string
  value: ReactNode
  sublabel?: string
  icon?: ReactNode
  tone?: keyof typeof iconCircleTones
}) {
  return (
    <div className="bg-surface border border-neutral-200/80 rounded-xl shadow-sm shadow-neutral-200/40 p-6 flex items-center gap-4">
      {icon && (
        <IconCircle tone={tone} size="lg">
          {icon}
        </IconCircle>
      )}
      <div className="min-w-0">
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="text-3xl font-bold text-neutral-900 tabular-nums leading-tight">{value}</p>
        {sublabel && <p className="text-xs text-neutral-400 mt-1 truncate">{sublabel}</p>}
      </div>
    </div>
  )
}

export function Menu({
  label,
  trigger,
  align = 'right',
  width = 'w-44',
  disabled,
  children,
}: {
  label?: ReactNode
  trigger?: ReactNode
  align?: 'left' | 'right'
  width?: string
  disabled?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="relative inline-block" ref={ref}>
      {trigger ? (
        <button type="button" disabled={disabled} onClick={() => setOpen((o) => !o)} className="focus:outline-none">
          {trigger}
        </button>
      ) : (
        <Button size="sm" disabled={disabled} onClick={() => setOpen((o) => !o)}>
          {label}
        </Button>
      )}
      {open && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 ${width} rounded-lg border border-neutral-200 bg-surface shadow-lg shadow-neutral-900/10 py-1 z-20 animate-fade-in`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export function MenuItem({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`w-full text-left px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors ${className}`}
      {...props}
    />
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
        className="bg-surface rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl shadow-neutral-900/15 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold text-neutral-900 text-lg tracking-tight">{title}</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="h-7 w-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors shrink-0"
            >
              <Icon path={iconPaths.close} className="h-4 w-4" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
