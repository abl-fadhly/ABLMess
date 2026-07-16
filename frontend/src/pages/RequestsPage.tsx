import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { useConfirm } from '../components/ConfirmContext'
import { useToast } from '../components/ToastContext'
import { Spinner, ErrorBanner, EmptyState } from '../components/Status'
import { Badge, Card, LinkButton, PageHeader, Table, Td, Th, Tr } from '../components/ui'
import { BookModal } from '../components/BookModal'
import { PlaceModal } from '../components/PlaceModal'
import type { RequestDto, UserDto } from '../api/types'

const statusTone: Record<string, 'warning' | 'success' | 'info' | 'neutral'> = {
  Requested: 'warning',
  Booked: 'success',
  Placed: 'info',
  Cancelled: 'neutral',
}

export function RequestsPage() {
  const { data: requests, loading, error, reload: load } = useFetch(() => api.get<RequestDto[]>('/requests'))
  const { data: users } = useFetch(() => api.get<UserDto[]>('/users'))
  const [bookingFor, setBookingFor] = useState<RequestDto | null>(null)
  const [placingFor, setPlacingFor] = useState<RequestDto | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const confirm = useConfirm()
  const toast = useToast()

  const crewName = (userId: number) => {
    const u = users?.find((u) => u.id === userId)
    return u ? `${u.firstName} ${u.lastName}` : `#${userId}`
  }

  async function cancel(id: number) {
    if (!(await confirm({ title: 'Cancel request?', message: 'This will cancel the request and cannot be undone.', tone: 'danger', confirmLabel: 'Cancel Request' })))
      return
    setCancellingId(id)
    try {
      await api.put(`/requests/${id}/cancel`)
      toast.success('Request cancelled.')
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to cancel request.')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div>
      <PageHeader title="Requests" />

      <Card>
        {loading && <Spinner label="Loading requests..." />}
        {error && <ErrorBanner message={error} />}
        {requests && requests.length === 0 && <EmptyState message="No requests yet." />}
        {requests && requests.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Request #</Th>
                <Th>Crew</Th>
                <Th>From</Th>
                <Th>To</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <Tr key={r.id}>
                  <Td>{r.id}</Td>
                  <Td>{crewName(r.userId)}</Td>
                  <Td>{r.from}</Td>
                  <Td>{r.to}</Td>
                  <Td>
                    <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                  </Td>
                  <Td>
                    {r.status === 'Requested' && (
                      <div className="flex gap-3">
                        <LinkButton tone="success" onClick={() => setBookingFor(r)}>
                          Book
                        </LinkButton>
                        <LinkButton tone="info" onClick={() => setPlacingFor(r)}>
                          Place in Hotel
                        </LinkButton>
                        <LinkButton tone="danger" onClick={() => cancel(r.id)} disabled={cancellingId === r.id}>
                          {cancellingId === r.id ? 'Cancelling...' : 'Cancel'}
                        </LinkButton>
                      </div>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {bookingFor && (
        <BookModal
          requestId={bookingFor.id}
          from={bookingFor.from}
          to={bookingFor.to}
          onClose={() => setBookingFor(null)}
          onDone={() => {
            setBookingFor(null)
            toast.success('Bed booked.')
            load()
          }}
        />
      )}

      {placingFor && (
        <PlaceModal
          requestId={placingFor.id}
          from={placingFor.from}
          to={placingFor.to}
          onClose={() => setPlacingFor(null)}
          onDone={() => {
            setPlacingFor(null)
            toast.success('Hotel placement logged.')
            load()
          }}
        />
      )}
    </div>
  )
}
