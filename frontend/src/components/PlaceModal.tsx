import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { ErrorBanner } from './Status'
import { Button, Input, Label, Modal } from './ui'

export function PlaceModal({
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
        requestId,
        hotelName,
        hotelAddress,
        from,
        to,
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
    <Modal title={`Log outside hotel placement — request #${requestId}`} onClose={onClose}>
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
