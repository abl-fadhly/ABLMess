import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { useBedIndex } from '../hooks/useBedIndex'
import { useConfirm } from '../components/ConfirmContext'
import { useToast } from '../components/ToastContext'
import { Spinner, ErrorBanner, EmptyState } from '../components/Status'
import { Badge, Card, LinkButton, PageHeader, Table, Td, Th, Tr } from '../components/ui'
import type { BookingDto, RequestDto, RoomDto, UserDto } from '../api/types'

const statusTone: Record<string, 'warning' | 'success' | 'neutral' | 'error'> = {
  Booked: 'warning',
  CheckedIn: 'success',
  CheckedOut: 'neutral',
  Cancelled: 'error',
}

export function BookingsPage() {
  const { data: bookings, loading, error, reload } = useFetch(() => api.get<BookingDto[]>('/bookings'))
  const { data: requests } = useFetch(() => api.get<RequestDto[]>('/requests'))
  const { data: users } = useFetch(() => api.get<UserDto[]>('/users'))
  const { data: rooms } = useFetch(() => api.get<RoomDto[]>('/rooms'))
  const bedIndex = useBedIndex(rooms)
  const [busyId, setBusyId] = useState<number | null>(null)
  const confirm = useConfirm()
  const toast = useToast()

  const crewName = (requestId: number) => {
    const request = requests?.find((r) => r.id === requestId)
    const user = request ? users?.find((u) => u.id === request.userId) : null
    return user ? `${user.firstName} ${user.lastName}` : `Request #${requestId}`
  }

  const bedLabel = (bedId: number) => {
    const bed = bedIndex.get(bedId)
    return bed ? `${bed.roomName} / ${bed.bedName}` : `#${bedId}`
  }

  async function withBusy(id: number, action: () => Promise<void>, successMessage: string) {
    setBusyId(id)
    try {
      await action()
      toast.success(successMessage)
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const checkIn = (id: number) => withBusy(id, () => api.put(`/bookings/${id}/check-in`), 'Checked in.')
  const checkOut = (id: number) => withBusy(id, () => api.put(`/bookings/${id}/check-out`), 'Checked out.')
  const cancel = async (id: number) => {
    if (
      !(await confirm({
        title: 'Cancel booking?',
        message: 'This will cancel the booking. The linked request will also be cancelled.',
        tone: 'danger',
        confirmLabel: 'Cancel Booking',
      }))
    )
      return
    return withBusy(id, () => api.put(`/bookings/${id}/cancel`), 'Booking cancelled.')
  }

  return (
    <div>
      <PageHeader title="Bookings" />
      <Card>
        {loading && <Spinner label="Loading bookings..." />}
        {error && <ErrorBanner message={error} />}
        {bookings && bookings.length === 0 && <EmptyState message="No bookings yet." />}
        {bookings && bookings.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Booking #</Th>
                <Th>Crew</Th>
                <Th>Bed</Th>
                <Th>From</Th>
                <Th>To</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <Tr key={b.id}>
                  <Td>{b.id}</Td>
                  <Td>{crewName(b.requestId)}</Td>
                  <Td>{bedLabel(b.bedId)}</Td>
                  <Td>{b.from}</Td>
                  <Td>{b.to}</Td>
                  <Td>
                    <Badge tone={statusTone[b.status]}>{b.status}</Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-3">
                      {b.status === 'Booked' && (
                        <LinkButton tone="success" onClick={() => checkIn(b.id)} disabled={busyId === b.id}>
                          Check In
                        </LinkButton>
                      )}
                      {b.status === 'CheckedIn' && (
                        <LinkButton onClick={() => checkOut(b.id)} disabled={busyId === b.id}>
                          Check Out
                        </LinkButton>
                      )}
                      {(b.status === 'Booked' || b.status === 'CheckedIn') && (
                        <LinkButton tone="danger" onClick={() => cancel(b.id)} disabled={busyId === b.id}>
                          Cancel
                        </LinkButton>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
