import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { Button, Modal } from './ui'

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  tone?: 'danger' | 'default'
}

type ConfirmContextValue = (options: ConfirmOptions | string) => Promise<boolean>

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((options: ConfirmOptions | string) => {
    const normalized = typeof options === 'string' ? { message: options } : options
    return new Promise<boolean>((resolve) => {
      setPending({ ...normalized, resolve })
    })
  }, [])

  function settle(result: boolean) {
    pending?.resolve(result)
    setPending(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <Modal title={pending.title ?? 'Are you sure?'} onClose={() => settle(false)}>
          <p className="text-sm text-neutral-600">{pending.message}</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => settle(false)}>
              Cancel
            </Button>
            <Button variant={pending.tone === 'danger' ? 'danger' : 'primary'} onClick={() => settle(true)}>
              {pending.confirmLabel ?? 'Confirm'}
            </Button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return ctx
}
