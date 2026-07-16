import { useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'
import { ErrorBanner } from './Status'
import { Button, Label, Modal, Select } from './ui'
import type { BedAvailabilityDto, RoomDto } from '../api/types'

export function BookModal({
  requestId,
  from,
  to,
  onClose,
  onDone,
}: {
  requestId: number
  from: string
  to: string
  onClose: () => void
  onDone: () => void
}) {
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
    api.get<BedAvailabilityDto[]>(`/rooms/${roomId}/beds?from=${from}&to=${to}`).then(setBeds)
  }, [roomId, from, to])

  async function confirmBooking() {
    if (bedId === null) return
    setError(null)
    setSaving(true)
    try {
      await api.post('/bookings', { requestId, bedId, from, to })
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to book.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Book a bed — request #${requestId} (${from} → ${to})`} onClose={onClose}>
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
                {b.bedName} {b.isAvailable ? '' : `(${b.status === 'Maintenance' ? 'maintenance' : 'unavailable'})`}
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
