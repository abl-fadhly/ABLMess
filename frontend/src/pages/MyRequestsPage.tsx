import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { useConfirm } from '../components/ConfirmContext'
import { useToast } from '../components/ToastContext'
import { Spinner, ErrorBanner, EmptyState } from '../components/Status'
import { Badge, Button, Card, Input, Label, LinkButton, PageHeader, Table, Td, Th, Tr } from '../components/ui'
import type { RequestDto } from '../api/types'

const statusTone: Record<string, 'warning' | 'success' | 'info' | 'neutral'> = {
  Requested: 'warning',
  Booked: 'success',
  Placed: 'info',
  Cancelled: 'neutral',
}

export function MyRequestsPage() {
  const { data: requests, loading, error, reload } = useFetch(() => api.get<RequestDto[]>('/requests/mine'))
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [comment, setComment] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ from?: string; to?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const confirm = useConfirm()
  const toast = useToast()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    const errors: { from?: string; to?: string } = {}
    if (!from) errors.from = 'From date is required.'
    if (!to) errors.to = 'To date is required.'
    if (from && to && to < from) errors.to = 'To date must not be before From date.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await api.post('/requests', { from, to, comment: comment || null })
      setFrom('')
      setTo('')
      setComment('')
      setFieldErrors({})
      toast.success('Request submitted.')
      reload()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  async function cancel(id: number) {
    if (
      !(await confirm({
        title: 'Cancel request?',
        message: 'This will cancel your room request.',
        tone: 'danger',
        confirmLabel: 'Cancel Request',
      }))
    )
      return
    setCancellingId(id)
    try {
      await api.put(`/requests/${id}/cancel`)
      toast.success('Request cancelled.')
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to cancel request.')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div>
      <PageHeader title="My Requests" />

      <div className="space-y-6">
        <Card title="Request a Room" className="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && <ErrorBanner message={formError} />}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="req-from">From</Label>
                <Input
                  id="req-from"
                  type="date"
                  value={from}
                  error={fieldErrors.from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="req-to">To</Label>
                <Input
                  id="req-to"
                  type="date"
                  value={to}
                  error={fieldErrors.to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="req-comment">Comment (optional)</Label>
              <Input id="req-comment" value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </Card>

        <Card title="History">
          {loading && <Spinner label="Loading your requests..." />}
          {error && <ErrorBanner message={error} />}
          {requests && requests.length === 0 && <EmptyState message="No requests yet." />}
          {requests && requests.length > 0 && (
            <Table>
              <thead>
                <tr>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Status</Th>
                  <Th>Comment</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <Tr key={r.id}>
                    <Td>{r.from}</Td>
                    <Td>{r.to}</Td>
                    <Td>
                      <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                    </Td>
                    <Td className="text-neutral-500">{r.comment ?? '—'}</Td>
                    <Td>
                      {r.status === 'Requested' && (
                        <LinkButton tone="danger" onClick={() => cancel(r.id)} disabled={cancellingId === r.id}>
                          {cancellingId === r.id ? 'Cancelling...' : 'Cancel'}
                        </LinkButton>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  )
}
