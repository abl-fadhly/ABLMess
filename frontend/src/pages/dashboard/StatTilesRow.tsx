import { StatTile } from '../../components/ui'
import type { DashboardStatsDto } from '../../api/types'

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

const icons = {
  pending: 'M4 4a2 2 0 012-2h6.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm7 6a1 1 0 100-2 1 1 0 000 2zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z',
  bed: 'M2 5a1 1 0 011-1h1a1 1 0 011 1v3h10V9a1 1 0 011-1h1a1 1 0 011 1v7a1 1 0 11-2 0v-1H4v1a1 1 0 11-2 0V5zm5 1a2 2 0 100 4 2 2 0 000-4z',
  pie: 'M10 2a8 8 0 108 8h-8V2z M12 2.05A8.001 8.001 0 0117.95 8H12V2.05z',
  checkIn: 'M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 100-2H4V6h6a1 1 0 100-2H3zm10.293 1.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L15.586 10H9a1 1 0 110-2h6.586l-2.293-2.293a1 1 0 010-1.414z',
  checkOut: 'M17 3a1 1 0 011 1v12a1 1 0 01-1 1h-7a1 1 0 110-2h6V6h-6a1 1 0 110-2h7zM6.707 4.293a1 1 0 010 1.414L4.414 8H11a1 1 0 110 2H4.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z',
  hotel: 'M10 2a1 1 0 011 1v1.323l3.954 1.582A1 1 0 0116 6.83V17a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3H9v3a1 1 0 01-1 1H5a1 1 0 01-1-1V6.83a1 1 0 01.546-.891L9 4.323V3a1 1 0 011-1z',
}

export function StatTilesRow({ stats }: { stats: DashboardStatsDto }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatTile label="Pending Requests" value={stats.pendingRequestsCount} tone="primary" icon={<Icon path={icons.pending} />} />
      <StatTile
        label="Available Beds"
        value={stats.availableBedsCount}
        sublabel="Across all locations"
        tone="success"
        icon={<Icon path={icons.bed} />}
      />
      <StatTile
        label="Occupancy Rate"
        value={`${stats.occupancyRatePercent}%`}
        sublabel={`${stats.totalBedsCount - stats.availableBedsCount} / ${stats.totalBedsCount} beds`}
        tone="warning"
        icon={<Icon path={icons.pie} />}
      />
      <StatTile
        label="Check-in Today"
        value={stats.checkInTodayCount}
        sublabel="Upcoming check-ins"
        tone="secondary"
        icon={<Icon path={icons.checkIn} />}
      />
      <StatTile
        label="Check-out Today"
        value={stats.checkOutTodayCount}
        sublabel="Upcoming check-outs"
        tone="error"
        icon={<Icon path={icons.checkOut} />}
      />
      <StatTile
        label="Hotel Placement"
        value={stats.hotelPlacementCount}
        sublabel="Crew in hotel"
        tone="info"
        icon={<Icon path={icons.hotel} />}
      />
    </div>
  )
}
