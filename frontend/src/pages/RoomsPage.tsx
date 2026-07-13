import { useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { useConfirm } from '../components/ConfirmContext'
import { useToast } from '../components/ToastContext'
import { Spinner, ErrorBanner, EmptyState } from '../components/Status'
import { Badge, Button, Card, Chip, Input, Label, LinkButton, Modal, PageHeader, Select } from '../components/ui'
import type { BedAvailabilityDto, LocationDto, RoomDto } from '../api/types'

const roomStatusTone: Record<string, 'success' | 'warning' | 'error'> = {
  Empty: 'success',
  Occupied: 'warning',
  Full: 'error',
}

function bedLetter(index: number) {
  return `Bed ${String.fromCharCode(65 + index)}`
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function BedChip({ available, size = 'sm' }: { available: boolean; size?: 'sm' | 'xs' }) {
  const dim = size === 'sm' ? 'h-4 w-4' : 'h-3 w-3'
  return available ? (
    <span className={`${dim} rounded border-[1.5px] border-neutral-300 bg-surface box-border shrink-0`} />
  ) : (
    <span className={`${dim} rounded bg-warning-default shrink-0`} />
  )
}

export function RoomsPage() {
  const { data: rooms, loading: roomsLoading, error: roomsError, reload: reloadRooms } = useFetch(() =>
    api.get<RoomDto[]>('/rooms'),
  )
  const { data: locations } = useFetch(() => api.get<LocationDto[]>('/locations'))
  const [roomBeds, setRoomBeds] = useState<Record<number, BedAvailabilityDto[]>>({})

  const [roomName, setRoomName] = useState('')
  const [locationId, setLocationId] = useState<number | ''>('')
  const [bedCount, setBedCount] = useState(2)
  const [fieldErrors, setFieldErrors] = useState<{ roomName?: string; locationId?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const [filter, setFilter] = useState('All')
  const [manageRoomId, setManageRoomId] = useState<number | null>(null)
  const [addingBed, setAddingBed] = useState(false)

  const confirm = useConfirm()
  const toast = useToast()

  async function loadRoomBeds(ids: number[]) {
    const today = todayStr()
    const entries = await Promise.all(
      ids.map(async (id) => [id, await api.get<BedAvailabilityDto[]>(`/rooms/${id}/beds?from=${today}&to=${today}`)] as const),
    )
    setRoomBeds((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
  }

  useEffect(() => {
    if (rooms && rooms.length > 0) loadRoomBeds(rooms.map((r) => r.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms])

  const locationName = (id: number) => locations?.find((l) => l.id === id)?.locationName ?? `#${id}`

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
      await Promise.all(
        Array.from({ length: bedCount }, (_, i) => api.post(`/rooms/${created.id}/beds`, { bedName: bedLetter(i) })),
      )
      setRoomName('')
      setLocationId('')
      setBedCount(2)
      setFieldErrors({})
      toast.success('Room added.')
      reloadRooms()
      loadRoomBeds([created.id])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create room.')
    } finally {
      setCreating(false)
    }
  }

  async function removeRoom(id: number) {
    if (
      !(await confirm({ title: 'Delete room?', message: 'This will delete the room and all its beds.', tone: 'danger', confirmLabel: 'Delete Room' }))
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

  async function addBedToManaged() {
    if (manageRoomId === null) return
    const nextIndex = roomBeds[manageRoomId]?.length ?? 0
    setAddingBed(true)
    try {
      await api.post(`/rooms/${manageRoomId}/beds`, { bedName: bedLetter(nextIndex) })
      await Promise.all([loadRoomBeds([manageRoomId]), Promise.resolve(reloadRooms())])
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add bed.')
    } finally {
      setAddingBed(false)
    }
  }

  async function removeManagedBed(bedId: number) {
    if (manageRoomId === null) return
    try {
      await api.delete(`/rooms/${manageRoomId}/beds/${bedId}`)
      toast.success('Bed removed.')
      await Promise.all([loadRoomBeds([manageRoomId]), Promise.resolve(reloadRooms())])
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove bed.')
    }
  }

  const filters = ['All', ...(locations?.map((l) => l.locationName) ?? [])]
  const filteredRooms = (rooms ?? []).filter((r) => filter === 'All' || locationName(r.locationId) === filter)
  const managedRoom = manageRoomId !== null ? rooms?.find((r) => r.id === manageRoomId) ?? null : null

  return (
    <div>
      <PageHeader title="Rooms" subtitle="Manage rooms and bed capacity per location" />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        <Card title="Add Room">
          <div className="space-y-3.5">
            {error && <ErrorBanner message={error} />}
            <div>
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                placeholder="e.g. Room 106"
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
            <div>
              <Label>Number of beds</Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBedCount((n) => Math.max(1, n - 1))}
                  className="h-9 w-9 shrink-0 rounded-lg border border-neutral-300 bg-surface text-neutral-700 text-base flex items-center justify-center hover:bg-neutral-50 transition-colors"
                  aria-label="Decrease bed count"
                >
                  −
                </button>
                <div className="flex-1 text-center rounded-lg border border-neutral-300 bg-surface px-3 py-2 text-sm font-semibold text-neutral-900 tabular-nums">
                  {bedCount}
                </div>
                <button
                  type="button"
                  onClick={() => setBedCount((n) => Math.min(12, n + 1))}
                  className="h-9 w-9 shrink-0 rounded-lg border border-neutral-300 bg-surface text-neutral-700 text-base flex items-center justify-center hover:bg-neutral-50 transition-colors"
                  aria-label="Increase bed count"
                >
                  +
                </button>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Will create: {Array.from({ length: bedCount }, (_, i) => bedLetter(i)).join(', ')}
              </p>
            </div>
            <Button onClick={addRoom} disabled={creating}>
              {creating ? 'Adding...' : 'Add Room'}
            </Button>
            {locations && locations.length === 0 && (
              <p className="text-xs text-neutral-500">No locations yet — add one under Reference Data first.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="font-semibold text-neutral-900">All Rooms</h2>
            <div className="flex gap-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <BedChip available size="xs" />
                Free bed
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <BedChip available={false} size="xs" />
                Booked bed
              </span>
            </div>
          </div>

          <div className="flex gap-1.5 mb-4 flex-wrap">
            {filters.map((f) => (
              <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f}
              </Chip>
            ))}
          </div>

          {roomsLoading && <Spinner label="Loading rooms..." />}
          {roomsError && <ErrorBanner message={roomsError} />}
          {rooms && rooms.length === 0 && <EmptyState message="No rooms yet." />}

          {filteredRooms.length > 0 && (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
              {filteredRooms.map((r) => {
                const beds = roomBeds[r.id]
                return (
                  <div key={r.id} className="border border-neutral-200 rounded-xl p-3.5 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900 text-[15px]">{r.roomName}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {locationName(r.locationId)} · {r.bedCount} {r.bedCount === 1 ? 'bed' : 'beds'}
                        </p>
                      </div>
                      <Badge tone={roomStatusTone[r.status]}>{r.status}</Badge>
                    </div>
                    {r.bedCount === 0 ? (
                      <p className="text-xs text-neutral-400">No beds yet</p>
                    ) : beds ? (
                      <div className="flex gap-1.5 flex-wrap">
                        {beds.map((b) => (
                          <BedChip key={b.id} available={b.isAvailable} />
                        ))}
                      </div>
                    ) : (
                      <div className="h-4" />
                    )}
                    <div className="flex gap-3 pt-1 border-t border-neutral-100">
                      <LinkButton onClick={() => setManageRoomId(r.id)}>
                        {r.bedCount === 0 ? 'Add beds' : 'Manage beds'}
                      </LinkButton>
                      <LinkButton tone="danger" onClick={() => removeRoom(r.id)}>
                        Delete
                      </LinkButton>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {managedRoom && (
        <Modal title={`Manage beds — ${managedRoom.roomName}`} onClose={() => setManageRoomId(null)}>
          <ul className="list-none m-0 p-0 flex flex-col">
            {(roomBeds[managedRoom.id] ?? []).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-neutral-100 last:border-0">
                <div className="flex items-center gap-2.5">
                  <BedChip available={b.isAvailable} size="xs" />
                  <span className="text-sm text-neutral-700">{b.bedName}</span>
                  <span className="text-xs text-neutral-400">{b.isAvailable ? 'Free' : 'Booked'}</span>
                </div>
                {b.isAvailable && (
                  <LinkButton tone="danger" onClick={() => removeManagedBed(b.id)}>
                    Remove
                  </LinkButton>
                )}
              </li>
            ))}
          </ul>
          <p className="text-xs text-neutral-500">Beds with an active booking can't be removed.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={addBedToManaged} disabled={addingBed}>
              {addingBed ? 'Adding...' : 'Add Bed'}
            </Button>
            <Button onClick={() => setManageRoomId(null)}>Done</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
