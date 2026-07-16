import { api } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Spinner, ErrorBanner, EmptyState } from '../../components/Status'
import { Badge, Card, CardLink, IconCircle } from '../../components/ui'
import { Icon, iconPaths } from '../../components/icons'
import type { ActivityDto, AuditActionType } from '../../api/types'

const MAX_ROWS = 5

const actionBadge: Record<AuditActionType, { label: string; tone: 'primary' | 'success' | 'info' | 'warning' | 'neutral' | 'error' }> = {
  RequestCreated: { label: 'Request', tone: 'primary' },
  RequestCancelled: { label: 'Request', tone: 'neutral' },
  Booked: { label: 'Booking', tone: 'success' },
  CheckedIn: { label: 'Check-in', tone: 'success' },
  CheckedOut: { label: 'Check-out', tone: 'info' },
  BookingCancelled: { label: 'Booking', tone: 'neutral' },
  HotelPlacementCreated: { label: 'Hotel Placement', tone: 'info' },
  RoomCreated: { label: 'Room Update', tone: 'neutral' },
  RoomUpdated: { label: 'Room Update', tone: 'neutral' },
  BedStatusChanged: { label: 'Room Update', tone: 'warning' },
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function RecentActivitiesFeed() {
  const { data: activities, loading, error } = useFetch(() => api.get<ActivityDto[]>('/dashboard/activities?limit=20'))
  const visible = activities?.slice(0, MAX_ROWS) ?? []

  return (
    <Card
      title={
        <>
          <IconCircle tone="warning" size="sm">
            <Icon path={iconPaths.activity} />
          </IconCircle>
          Recent Activities
        </>
      }
      action={<CardLink to="/logs">View all</CardLink>}
    >
      {loading && <Spinner label="Loading activities..." />}
      {error && <ErrorBanner message={error} />}
      {activities && activities.length === 0 && <EmptyState message="No activity yet." />}
      {visible.length > 0 && (
        <ul className="list-none m-0 p-0">
          {visible.map((a) => {
            const badge = actionBadge[a.actionType]
            const who = a.subjectUserFullName ?? a.actorUserFullName
            return (
              <li key={a.id} className="flex items-start justify-between gap-3 py-2.5 border-b border-neutral-100 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm text-neutral-700 truncate">
                    {who && <span className="font-medium text-neutral-900">{who} </span>}
                    {a.description}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">{timeAgo(a.createdAt)}</p>
                </div>
                <Badge tone={badge.tone}>{badge.label}</Badge>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
