import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { Spinner, ErrorBanner, EmptyState } from '../components/Status'
import { Card, PageHeader } from '../components/ui'
import type { DashboardDto } from '../api/types'

function StatRow({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${tone}`}>{value}</span>
    </div>
  )
}

function KpiTile({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}) {
  const dotClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-default',
    warning: 'bg-warning-default',
    error: 'bg-error-default',
  }[accent]

  return (
    <div className="bg-surface border border-neutral-200/80 rounded-xl shadow-sm shadow-neutral-200/40 dark:shadow-black/20 p-4">
      <p className="text-2xl font-bold text-neutral-900 tabular-nums tracking-tight">{value}</p>
      <p className="text-xs font-medium text-neutral-500 mt-1 flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClasses}`} aria-hidden="true" />
        {label}
      </p>
    </div>
  )
}

export function DashboardPage() {
  const { data, loading, error } = useFetch(() => api.get<DashboardDto>('/dashboard'))

  const totals = data?.occupancy.reduce(
    (acc, o) => ({
      empty: acc.empty + o.emptyRooms,
      occupied: acc.occupied + o.occupiedRooms,
      full: acc.full + o.fullRooms,
    }),
    { empty: 0, occupied: 0, full: 0 },
  )

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live overview of mess occupancy and crew activity" />

      {loading && <Spinner label="Loading dashboard..." />}
      {error && <ErrorBanner message={error} />}

      {data && totals && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiTile label="Empty rooms" value={totals.empty} accent="success" />
            <KpiTile label="Occupied rooms" value={totals.occupied} accent="warning" />
            <KpiTile label="Full rooms" value={totals.full} accent="error" />
            <KpiTile label="Pending requests" value={data.pendingRequests.length} accent="warning" />
            <KpiTile label="In outside hotels" value={data.crewInOutsideHotels.length} accent="secondary" />
          </div>

          <Card title="Occupancy by Location">
            {data.occupancy.length === 0 ? (
              <EmptyState message="No locations yet." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.occupancy.map((o) => (
                  <div key={o.locationId} className="rounded-xl border border-neutral-200 p-4">
                    <p className="font-medium text-neutral-900 mb-2">{o.locationName}</p>
                    <StatRow label="Empty" value={o.emptyRooms} tone="text-success-default" />
                    <StatRow label="Occupied" value={o.occupiedRooms} tone="text-warning-default" />
                    <StatRow label="Full" value={o.fullRooms} tone="text-error-default" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['tomorrow', 'next3Days', 'next7Days'] as const).map((key) => (
              <Card
                key={key}
                title={key === 'tomorrow' ? 'Tomorrow' : key === 'next3Days' ? 'Next 3 Days' : 'Next 7 Days'}
              >
                {data.upcomingCheckInsAndOuts[key].length === 0 ? (
                  <EmptyState message="Nothing upcoming." />
                ) : (
                  <ul className="text-sm divide-y divide-neutral-100">
                    {data.upcomingCheckInsAndOuts[key].map((u) => (
                      <li key={`${u.bookingId}-${u.kind}`} className="flex justify-between py-2 first:pt-0 last:pb-0">
                        <span className="text-neutral-700">{u.userFullName}</span>
                        <span className="text-neutral-500 text-xs mt-0.5">
                          {u.kind === 'ClockIn' ? 'Check-in' : 'Check-out'} · {u.date}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>

          <Card title="Pending Requests">
            {data.pendingRequests.length === 0 ? (
              <EmptyState message="No pending requests." />
            ) : (
              <ul className="text-sm divide-y divide-neutral-100">
                {data.pendingRequests.map((r) => (
                  <li key={r.requestId} className="flex justify-between py-2 first:pt-0 last:pb-0">
                    <span className="text-neutral-700">{r.userFullName}</span>
                    <span className="text-neutral-500">
                      {r.from} → {r.to}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Crew Currently in Outside Hotels">
            {data.crewInOutsideHotels.length === 0 ? (
              <EmptyState message="None currently." />
            ) : (
              <ul className="text-sm divide-y divide-neutral-100">
                {data.crewInOutsideHotels.map((h) => (
                  <li key={h.placementId} className="flex justify-between py-2 first:pt-0 last:pb-0">
                    <span className="text-neutral-700">{h.userFullName}</span>
                    <span className="text-neutral-500">
                      {h.hotelName} · {h.from} → {h.to}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
