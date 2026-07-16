import { Avatar, Card, CardLink, IconCircle, Table, Td, Th, Tr } from '../../components/ui'
import { Icon, iconPaths } from '../../components/icons'
import { EmptyState } from '../../components/Status'
import type { ActiveHotelPlacementDto } from '../../api/types'

function nightsBetween(from: string, to: string) {
  const days = Math.round((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24))
  return `${days} night${days === 1 ? '' : 's'}`
}

const MAX_ROWS = 5

export function HotelPlacementTable({ placements }: { placements: ActiveHotelPlacementDto[] }) {
  const visible = placements.slice(0, MAX_ROWS)
  return (
    <Card
      title={
        <>
          <IconCircle tone="info" size="sm">
            <Icon path={iconPaths.building} />
          </IconCircle>
          Hotel Placement ({placements.length})
        </>
      }
      action={<CardLink to="/logs">View all</CardLink>}
    >
      {placements.length === 0 ? (
        <EmptyState message="None currently." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Crew</Th>
              <Th>Hotel</Th>
              <Th>Reason</Th>
              <Th>Check In</Th>
              <Th>Duration</Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <Tr key={p.placementId}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={p.userFullName} photoUrl={p.userPhotoUrl} size="sm" />
                    <div className="min-w-0">
                      <p className="text-base font-medium text-neutral-900 truncate">{p.userFullName}</p>
                      <p className="text-xs text-neutral-500">ID: {p.userEmployeeCode}</p>
                    </div>
                  </div>
                </Td>
                <Td>{p.hotelName}</Td>
                <Td>{p.reason ?? '—'}</Td>
                <Td>{p.from}</Td>
                <Td>{nightsBetween(p.from, p.to)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  )
}
