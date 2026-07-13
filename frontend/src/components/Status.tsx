export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-neutral-500 py-8 justify-center">
      <span
        className="inline-block h-4 w-4 rounded-full border-2 border-neutral-200 border-t-primary-600 animate-spin"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2 text-sm text-error-dark bg-error-light border border-error-default/20 rounded-lg px-3 py-2.5"
      role="alert"
    >
      <span aria-hidden="true">⚠</span>
      <span>{message}</span>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10">
      <div className="mx-auto h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-neutral-400" aria-hidden="true">
          <path
            d="M4 6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm text-neutral-400">{message}</p>
    </div>
  )
}
