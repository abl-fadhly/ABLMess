import { Avatar, Card, CardLink, IconCircle } from '../../components/ui'
import { Icon, iconPaths } from '../../components/icons'
import { EmptyState } from '../../components/Status'
import type { UpcomingBookingDto } from '../../api/types'

const MAX_ROWS = 5

function BookingList({ bookings, tone }: { bookings: UpcomingBookingDto[]; tone: 'success' | 'error' }) {
  if (bookings.length === 0) {
    return <EmptyState message="None today." />
  }
  return (
    <ul className="list-none m-0 p-0">
      {bookings.slice(0, MAX_ROWS).map((b) => (
        <li key={b.bookingId} className="flex items-center gap-3 py-3 border-b border-neutral-100 last:border-0">
          <Avatar name={b.userFullName} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-neutral-900 truncate">{b.userFullName}</p>
            <p className="text-sm text-neutral-500 truncate">
              {b.locationName} · Room {b.roomName} · {b.bedName}
            </p>
          </div>
          <IconCircle tone={tone} size="sm">
            <Icon path={tone === 'success' ? iconPaths.checkIn : iconPaths.checkOut} />
          </IconCircle>
        </li>
      ))}
    </ul>
  )
}

export function CheckInOutLists({ today, next3Days }: { today: string; next3Days: UpcomingBookingDto[] }) {
  const checkInsToday = next3Days.filter((b) => b.kind === 'CheckIn' && b.date === today)
  const checkOutsToday = next3Days.filter((b) => b.kind === 'CheckOut' && b.date === today)

  return (
    <div className="flex flex-col gap-6">
      <Card
        title={
          <>
            <IconCircle tone="success" size="sm">
              <Icon path={iconPaths.checkIn} />
            </IconCircle>
            Today's Check-in ({checkInsToday.length})
          </>
        }
        action={<CardLink to="/bookings">View all</CardLink>}
      >
        <BookingList bookings={checkInsToday} tone="success" />
      </Card>
      <Card
        title={
          <>
            <IconCircle tone="error" size="sm">
              <Icon path={iconPaths.checkOut} />
            </IconCircle>
            Today's Check-out ({checkOutsToday.length})
          </>
        }
        action={<CardLink to="/bookings">View all</CardLink>}
      >
        <BookingList bookings={checkOutsToday} tone="error" />
      </Card>
    </div>
  )
}
