import { useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { useConfirm } from '../components/ConfirmContext'
import { useToast } from '../components/ToastContext'
import { Spinner, ErrorBanner, EmptyState } from '../components/Status'
import { Badge, Button, Card, Input, Label, LinkButton, Modal, PageHeader, Select, Table, Td, Th, Tr } from '../components/ui'
import type { BedAvailabilityDto, RequestDto, RoomDto, UserDto } from '../api/types'

const statusTone: Record<string, 'warning' | 'success' | 'info' | 'neutral'> = {
  Requested: 'warning',
  Booked: 'success',
  Placed: 'info',
  Cancelled: 'neutral',
}

function BookModal({ request, onClose, onDone }: { request: RequestDto; onClose: () => void; onDone: () => void }) {
  const [rooms, setRooms] = useState<RoomDto[]>([])
  const [roomId, setRoomId] = useState<number | null>(null)
  const [beds, setBeds] = useState<BedAvailabilityDto[]>([])
  const [bedId, setBedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get<RoomDto[]>('/rooms').then(setRooms)
  }, [])

  useEffect(() => {
    if (roomId === null) {
      setBeds([])
      return
    }
    api
      .get<BedAvailabilityDto[]>(`/rooms/${roomId}/beds?from=${request.from}&to=${request.to}`)
      .then(setBeds)
  }, [roomId, request.from, request.to])

  async function confirmBooking() {
    if (bedId === null) return
    setError(null)
    setSaving(true)
    try {
      await api.post('/bookings', { requestId: request.id, bedId, from: request.from, to: request.to })
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to book.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Book a bed — request #${request.id} (${request.from} → ${request.to})`} onClose={onClose}>
      {error && <ErrorBanner message={error} />}

      <div>
        <Label htmlFor="book-room">Room</Label>
        <Select
          id="book-room"
          value={roomId ?? ''}
          onChange={(e) => {
            setRoomId(e.target.value ? Number(e.target.value) : null)
            setBedId(null)
          }}
        >
          <option value="">Select a room</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id} disabled={r.status === 'Full'}>
              {r.roomName} ({r.status}, {r.bedCount} beds)
            </option>
          ))}
        </Select>
      </div>

      {roomId !== null && (
        <div>
          <Label htmlFor="book-bed">Bed</Label>
          <Select id="book-bed" value={bedId ?? ''} onChange={(e) => setBedId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Select a bed</option>
            {beds.map((b) => (
              <option key={b.id} value={b.id} disabled={!b.isAvailable}>
                {b.bedName} {b.isAvailable ? '' : '(unavailable)'}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={confirmBooking} disabled={bedId === null || saving}>
          {saving ? 'Booking...' : 'Confirm Booking'}
        </Button>
      </div>
    </Modal>
  )
}

function PlaceModal({ request, onClose, onDone }: { request: RequestDto; onClose: () => void; onDone: () => void }) {
  const [hotelName, setHotelName] = useState('')
  const [hotelAddress, setHotelAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function confirm() {
    setError(null)
    setSaving(true)
    try {
      await api.post('/hotel-placements', {
        requestId: request.id,
        hotelName,
        hotelAddress,
        from: request.from,
        to: request.to,
        notes: notes || null,
      })
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to log placement.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Log outside hotel placement — request #${request.id}`} onClose={onClose}>
      {error && <ErrorBanner message={error} />}
      <div>
        <Label htmlFor="hotel-name">Hotel Name</Label>
        <Input id="hotel-name" value={hotelName} onChange={(e) => setHotelName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="hotel-address">Hotel Address</Label>
        <Input id="hotel-address" value={hotelAddress} onChange={(e) => setHotelAddress(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="hotel-notes">Notes (optional)</Label>
        <Input id="hotel-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={confirm} disabled={!hotelName || !hotelAddress || saving}>
          {saving ? 'Saving...' : 'Confirm Placement'}
        </Button>
      </div>
    </Modal>
  )
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
          request={bookingFor}
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
          request={placingFor}
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
