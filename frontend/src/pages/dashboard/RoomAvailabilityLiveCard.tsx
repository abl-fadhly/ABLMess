import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Spinner, ErrorBanner, EmptyState } from '../../components/Status'
import { Card, IconCircle, Select } from '../../components/ui'
import { Icon, iconPaths } from '../../components/icons'
import type { LocationDto, RoomWithBedsDto } from '../../api/types'

function bedDotClass(bed: RoomWithBedsDto['beds'][number]) {
  if (bed.status === 'Maintenance') return 'bg-warning-default'
  return bed.isAvailable ? 'bg-neutral-200' : 'bg-error-default'
}

export function RoomAvailabilityLiveCard() {
  const { data: locations } = useFetch(() => api.get<LocationDto[]>('/locations'))
  const [locationId, setLocationId] = useState<number | null>(null)

  useEffect(() => {
    if (locationId === null && locations && locations.length > 0) {
      setLocationId(locations[0].id)
    }
  }, [locations, locationId])

  const {
    data: rooms,
    loading,
    error,
    reload,
  } = useFetch(
    () => (locationId === null ? Promise.resolve([]) : api.get<RoomWithBedsDto[]>(`/rooms/beds/by-location/${locationId}`)),
    [locationId],
  )

  return (
    <Card
      title={
        <>
          <IconCircle tone="success" size="sm">
            <Icon path={iconPaths.bed} />
          </IconCircle>
          Room Availability
        </>
      }
      action={
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Live</span>
          <button onClick={reload} className="text-sm font-medium text-secondary-700 hover:text-secondary-800 hover:underline underline-offset-2">
            Refresh
          </button>
        </div>
      }
    >
      <div className="max-w-xs mb-4">
        <Select value={locationId ?? ''} onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : null)}>
          {locations?.map((l) => (
            <option key={l.id} value={l.id}>
              {l.locationName}
            </option>
          ))}
        </Select>
      </div>

      {loading && <Spinner label="Loading rooms..." />}
      {error && <ErrorBanner message={error} />}
      {rooms && rooms.length === 0 && !loading && <EmptyState message="No rooms in this location." />}
      {rooms && rooms.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {rooms.map((room) => (
            <div key={room.id} className="rounded-lg border border-neutral-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-base font-medium text-neutral-900">{room.roomName}</p>
                <span className="text-xs text-neutral-400">{room.beds.length} beds</span>
              </div>
              <p className="text-xs text-neutral-500 mb-2">{room.status}</p>
              <div className="flex flex-wrap gap-1.5">
                {room.beds.map((bed) => (
                  <span
                    key={bed.id}
                    title={`${bed.bedName}: ${bed.status === 'Maintenance' ? 'Maintenance' : bed.isAvailable ? 'Available' : 'Occupied'}`}
                    className={`h-3 w-3 rounded-full ${bedDotClass(bed)}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
