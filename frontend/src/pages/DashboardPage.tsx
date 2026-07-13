import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { useToast } from '../components/ToastContext'
import { Spinner, ErrorBanner, EmptyState } from '../components/Status'
import { Button, Card } from '../components/ui'
import type { DashboardDto, UpcomingBookingDto } from '../api/types'

function StatPill({ color, value, label }: { color: string; value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-surface px-3 py-1 text-xs text-neutral-600">
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} aria-hidden="true" />
      <span className="font-semibold text-neutral-900 tabular-nums">{value}</span>
      {label}
    </span>
  )
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function DashboardPage() {
  const { data, loading, error, reload } = useFetch(() => api.get<DashboardDto>('/dashboard'))
  const navigate = useNavigate()
  const toast = useToast()

  async function clockIn(bookingId: number) {
    try {
      await api.put(`/bookings/${bookingId}/clock-in`)
      toast.success('Clocked in.')
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to clock in.')
    }
  }

  async function clockOut(bookingId: number) {
    try {
      await api.put(`/bookings/${bookingId}/clock-out`)
      toast.success('Clocked out.')
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to clock out.')
    }
  }

  const totals = data?.occupancy.reduce(
    (acc, o) => ({
      empty: acc.empty + o.emptyRooms,
      occupied: acc.occupied + o.occupiedRooms,
      full: acc.full + o.fullRooms,
    }),
    { empty: 0, occupied: 0, full: 0 },
  )

  const today = todayStr()
  const tomorrow = tomorrowStr()
  const todayAndTomorrow: UpcomingBookingDto[] =
    data?.upcomingCheckInsAndOuts.next3Days
      .filter((u) => u.date === today || u.date === tomorrow)
      .sort((a, b) => a.date.localeCompare(b.date)) ?? []
  const moreMovements = Math.max(0, (data?.upcomingCheckInsAndOuts.next7Days.length ?? 0) - todayAndTomorrow.length)

  return (
    <div>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Live overview of mess occupancy and crew activity</p>
        </div>
        {totals && data && (
          <div className="flex flex-wrap gap-2">
            <StatPill color="#30a65b" value={totals.empty} label="empty" />
            <StatPill color="#c68310" value={totals.occupied} label="occupied" />
            <StatPill color="#b81e26" value={totals.full} label="full" />
            <StatPill color="#3075cf" value={data.crewInOutsideHotels.length} label="in hotels" />
          </div>
        )}
      </div>

      {loading && <Spinner label="Loading dashboard..." />}
      {error && <ErrorBanner message={error} />}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 items-start">
          <div className="flex flex-col gap-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-900">Pending Requests ({data.pendingRequests.length})</h2>
                <Link to="/requests" className="text-sm font-medium text-secondary-700 hover:underline">
                  View all
                </Link>
              </div>
              {data.pendingRequests.length === 0 ? (
                <EmptyState message="No pending requests." />
              ) : (
                <ul className="list-none m-0 p-0">
                  {data.pendingRequests.map((r) => (
                    <li
                      key={r.requestId}
                      className="flex items-center justify-between gap-3 py-2.5 border-b border-neutral-100 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900">{r.userFullName}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {r.from} → {r.to}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" onClick={() => navigate('/requests')}>
                          Book
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => navigate('/requests')}>
                          Place
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-900">
                  Crew in Outside Hotels ({data.crewInOutsideHotels.length})
                </h2>
                <Link to="/logs" className="text-sm font-medium text-secondary-700 hover:underline">
                  View log
                </Link>
              </div>
              {data.crewInOutsideHotels.length === 0 ? (
                <EmptyState message="None currently." />
              ) : (
                <ul className="list-none m-0 p-0">
                  {data.crewInOutsideHotels.map((h) => (
                    <li
                      key={h.placementId}
                      className="flex items-center justify-between gap-3 py-2.5 border-b border-neutral-100 last:border-0"
                    >
                      <p className="text-sm text-neutral-700">{h.userFullName}</p>
                      <p className="text-xs text-neutral-500 shrink-0">
                        {h.hotelName} · {h.from} → {h.to}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card title="Today & Tomorrow">
              {todayAndTomorrow.length === 0 ? (
                <EmptyState message="Nothing upcoming." />
              ) : (
                <ul className="list-none m-0 p-0">
                  {todayAndTomorrow.map((u) => (
                    <li
                      key={`${u.bookingId}-${u.kind}`}
                      className="flex items-center justify-between gap-3 py-2.5 border-b border-neutral-100 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-neutral-700">{u.userFullName}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {u.kind === 'ClockIn' ? 'Check-in' : 'Check-out'} · {u.date === today ? 'today' : 'tomorrow'}
                        </p>
                      </div>
                      {u.date === today ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => (u.kind === 'ClockIn' ? clockIn(u.bookingId) : clockOut(u.bookingId))}
                        >
                          {u.kind === 'ClockIn' ? 'Check In' : 'Check Out'}
                        </Button>
                      ) : (
                        <span className="text-xs text-neutral-400 shrink-0">Upcoming</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {moreMovements > 0 && (
                <p className="mt-3 pt-3 border-t border-dashed border-neutral-200 text-xs text-neutral-500">
                  Next 7 days: {moreMovements} more movement{moreMovements === 1 ? '' : 's'}
                </p>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-900">Occupancy by Location</h2>
                <Link to="/rooms" className="text-sm font-medium text-secondary-700 hover:underline">
                  Rooms
                </Link>
              </div>
              {data.occupancy.length === 0 ? (
                <EmptyState message="No locations yet." />
              ) : (
                <div className="flex flex-col gap-4">
                  {data.occupancy.map((o) => {
                    const total = o.emptyRooms + o.occupiedRooms + o.fullRooms
                    const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100)
                    return (
                      <div key={o.locationId}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium text-neutral-900">{o.locationName}</p>
                          <p className="text-xs text-neutral-500 tabular-nums">
                            {o.fullRooms}/{total} full
                          </p>
                        </div>
                        <div className="flex h-2 rounded-full overflow-hidden bg-neutral-100">
                          <div style={{ width: `${pct(o.emptyRooms)}%`, background: '#30a65b' }} />
                          <div style={{ width: `${pct(o.occupiedRooms)}%`, background: '#c68310' }} />
                          <div style={{ width: `${pct(o.fullRooms)}%`, background: '#b81e26' }} />
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex gap-4 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#30a65b' }} />
                      Empty
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#c68310' }} />
                      Occupied
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#b81e26' }} />
                      Full
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
