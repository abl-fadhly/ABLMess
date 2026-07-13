import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { useConfirm } from '../components/ConfirmContext'
import { useToast } from '../components/ToastContext'
import { Spinner, ErrorBanner, EmptyState } from '../components/Status'
import { Badge, Button, Card, Input, Label, LinkButton, PageHeader, Select } from '../components/ui'
import type { BedDto, LocationDto, RoomDto } from '../api/types'

const roomStatusTone: Record<string, 'success' | 'warning' | 'error'> = {
  Empty: 'success',
  Occupied: 'warning',
  Full: 'error',
}

function RoomBeds({ room }: { room: RoomDto }) {
  const { data: beds, loading, error, reload } = useFetch(() => api.get<BedDto[]>(`/rooms/${room.id}/beds/list`), [room.id])
  const [bedName, setBedName] = useState('')
  const [bedNameError, setBedNameError] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const confirm = useConfirm()
  const toast = useToast()

  async function addBed() {
    if (!bedName.trim()) {
      setBedNameError('Bed name is required.')
      return
    }
    setBedNameError(undefined)
    setBusy(true)
    try {
      await api.post(`/rooms/${room.id}/beds`, { bedName })
      setBedName('')
      toast.success('Bed added.')
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add bed.')
    } finally {
      setBusy(false)
    }
  }

  async function removeBed(bedId: number) {
    if (!(await confirm({ title: 'Remove bed?', message: 'This bed will be removed from the room.', tone: 'danger', confirmLabel: 'Remove Bed' })))
      return
    try {
      await api.delete(`/rooms/${room.id}/beds/${bedId}`)
      toast.success('Bed removed.')
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove bed.')
    }
  }

  return (
    <div className="pl-4 border-l-2 border-neutral-100 space-y-2 mt-2">
      {loading && <Spinner label="Loading beds..." />}
      {error && <ErrorBanner message={error} />}
      {beds && beds.length === 0 && <p className="text-xs text-neutral-400">No beds yet.</p>}
      {beds && beds.length > 0 && (
        <ul className="text-sm space-y-1">
          {beds.map((b) => (
            <li key={b.id} className="flex items-center justify-between">
              <span className="text-neutral-700">{b.bedName}</span>
              <LinkButton tone="danger" onClick={() => removeBed(b.id)}>
                Remove
              </LinkButton>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <Input
            id={`bed-name-${room.id}`}
            value={bedName}
            onChange={(e) => setBedName(e.target.value)}
            error={bedNameError}
            placeholder="New bed name"
            className="text-xs py-1.5"
          />
        </div>
        <Button size="sm" onClick={addBed} disabled={busy}>
          {busy ? 'Adding...' : 'Add Bed'}
        </Button>
      </div>
    </div>
  )
}

export function RoomsPage() {
  const { data: rooms, loading: roomsLoading, error: roomsError, reload: reloadRooms } = useFetch(() =>
    api.get<RoomDto[]>('/rooms'),
  )
  const { data: locations } = useFetch(() => api.get<LocationDto[]>('/locations'))
  const [roomName, setRoomName] = useState('')
  const [locationId, setLocationId] = useState<number | ''>('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ roomName?: string; locationId?: string }>({})
  const [creating, setCreating] = useState(false)
  const confirm = useConfirm()
  const toast = useToast()

  async function addRoom() {
    const errors: { roomName?: string; locationId?: string } = {}
    if (!roomName.trim()) errors.roomName = 'Room name is required.'
    if (locationId === '') errors.locationId = 'Select a location.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setError(null)
    setCreating(true)
    try {
      const created = await api.post<RoomDto>('/rooms', { roomName, locationId })
      setRoomName('')
      setLocationId('')
      setFieldErrors({})
      setExpanded(created.id)
      toast.success('Room added.')
      reloadRooms()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create room.')
    } finally {
      setCreating(false)
    }
  }

  async function removeRoom(id: number) {
    if (
      !(await confirm({
        title: 'Delete room?',
        message: 'This will delete the room and all its beds.',
        tone: 'danger',
        confirmLabel: 'Delete Room',
      }))
    )
      return
    try {
      await api.delete(`/rooms/${id}`)
      toast.success('Room deleted.')
      reloadRooms()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete room.')
    }
  }

  const locationName = (id: number) => locations?.find((l) => l.id === id)?.locationName ?? `#${id}`

  return (
    <div>
      <PageHeader title="Rooms" />

      <div className="space-y-6">
        <Card title="Add Room" className="max-w-md">
          <div className="space-y-3">
            {error && <ErrorBanner message={error} />}
            <div>
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                value={roomName}
                error={fieldErrors.roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="room-location">Location</Label>
              <Select
                id="room-location"
                value={locationId}
                error={fieldErrors.locationId}
                onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select a location</option>
                {locations?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.locationName}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={addRoom} disabled={creating}>
              {creating ? 'Adding...' : 'Add Room'}
            </Button>
            {locations && locations.length === 0 && (
              <p className="text-xs text-neutral-500">No locations yet — add one under Reference Data first.</p>
            )}
          </div>
        </Card>

        <Card title="All Rooms">
          {roomsLoading && <Spinner label="Loading rooms..." />}
          {roomsError && <ErrorBanner message={roomsError} />}
          {rooms && rooms.length === 0 && <EmptyState message="No rooms yet." />}
          {rooms && rooms.length > 0 && (
            <ul className="divide-y divide-neutral-100">
              {rooms.map((r) => (
                <li key={r.id} className="py-1 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between rounded-lg px-3 py-2 -mx-3 transition-colors hover:bg-neutral-50">
                    <button
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      className="flex items-center gap-2.5 flex-wrap text-left group"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`h-3.5 w-3.5 text-neutral-400 transition-transform shrink-0 ${expanded === r.id ? 'rotate-90' : ''}`}
                        aria-hidden="true"
                      >
                        <path d="M7.05 4.55a1 1 0 011.414 0l4.243 4.243a1 1 0 010 1.414l-4.243 4.243a1 1 0 01-1.414-1.414L10.586 9.5 7.05 5.964a1 1 0 010-1.414z" />
                      </svg>
                      <span className="font-medium text-neutral-900 group-hover:text-secondary-700">
                        {r.roomName}
                      </span>
                      <span className="text-neutral-400 text-sm">
                        {locationName(r.locationId)} · {r.bedCount} beds
                      </span>
                      <Badge tone={roomStatusTone[r.status]}>{r.status}</Badge>
                    </button>
                    <LinkButton tone="danger" onClick={() => removeRoom(r.id)}>
                      Delete
                    </LinkButton>
                  </div>
                  {expanded === r.id && <RoomBeds room={r} />}
                  {expanded !== r.id && (
                    <button
                      onClick={() => setExpanded(r.id)}
                      className="text-xs text-secondary-700 hover:underline mt-1 ml-6"
                    >
                      {r.bedCount === 0 ? 'Add beds' : 'Manage beds'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
