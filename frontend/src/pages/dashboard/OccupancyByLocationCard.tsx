import { Badge, Card, CardLink, IconCircle, ProgressBar } from '../../components/ui'
import { Icon, iconPaths } from '../../components/icons'
import { EmptyState } from '../../components/Status'
import type { LocationBedOccupancyDto } from '../../api/types'

function LocationThumbnail({ imageUrl }: { imageUrl: string | null }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className="h-20 w-20 rounded-xl object-cover shrink-0" />
  }
  return (
    <div className="h-20 w-20 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center shrink-0" aria-hidden="true">
      <Icon path={iconPaths.building} className="h-8 w-8" />
    </div>
  )
}

export function OccupancyByLocationCard({ locations }: { locations: LocationBedOccupancyDto[] }) {
  return (
    <Card
      title={
        <>
          <IconCircle tone="secondary" size="sm">
            <Icon path={iconPaths.building} />
          </IconCircle>
          Occupancy by Location
        </>
      }
      action={<CardLink to="/rooms">View all locations</CardLink>}
    >
      {locations.length === 0 ? (
        <EmptyState message="No locations yet." />
      ) : (
        <ul className="list-none m-0 p-0 space-y-5">
          {locations.map((l) => {
            const percent = l.totalBeds === 0 ? 0 : Math.round((l.occupiedBeds / l.totalBeds) * 100)
            return (
              <li key={l.locationId} className="flex items-center gap-4 pb-5 border-b border-neutral-100 last:border-0 last:pb-0">
                <LocationThumbnail imageUrl={l.imageUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-semibold text-neutral-900 truncate">{l.locationName}</p>
                    <span className="text-lg font-bold text-neutral-900 tabular-nums shrink-0">{percent}%</span>
                  </div>
                  <ProgressBar
                    value={l.occupiedBeds}
                    max={l.totalBeds}
                    tone={l.availableBeds === 0 ? 'error' : percent >= 80 ? 'warning' : 'primary'}
                    className="my-2 h-2.5"
                  />
                  <div className="flex items-center justify-between gap-2 text-sm text-neutral-500">
                    <span>
                      Available: {l.availableBeds} · Maintenance: {l.maintenanceBeds}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {l.occupiedBeds} / {l.totalBeds} beds
                      {l.availableBeds === 0 && <Badge tone="error">FULL</Badge>}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
