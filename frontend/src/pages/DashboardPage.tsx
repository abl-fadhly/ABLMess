import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { Spinner, ErrorBanner } from '../components/Status'
import { PageHeader } from '../components/ui'
import type { DashboardDto } from '../api/types'
import { StatTilesRow } from './dashboard/StatTilesRow'
import { PendingRequestsCard } from './dashboard/PendingRequestsCard'
import { OccupancyByLocationCard } from './dashboard/OccupancyByLocationCard'
import { RoomAvailabilityLiveCard } from './dashboard/RoomAvailabilityLiveCard'
import { CheckInOutLists } from './dashboard/CheckInOutLists'
import { HotelPlacementTable } from './dashboard/HotelPlacementTable'
import { RecentActivitiesFeed } from './dashboard/RecentActivitiesFeed'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function DashboardPage() {
  const { data, loading, error, reload } = useFetch(() => api.get<DashboardDto>('/dashboard'))
  const today = todayStr()

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of room request, occupancy and today's activities" />

      {loading && <Spinner label="Loading dashboard..." />}
      {error && <ErrorBanner message={error} />}

      {data && (
        <div className="space-y-6">
          <StatTilesRow stats={data.stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-6">
              <PendingRequestsCard requests={data.pendingRequests} onChanged={reload} />
              <RoomAvailabilityLiveCard />
              <HotelPlacementTable placements={data.crewInOutsideHotels} />
            </div>

            <div className="flex flex-col gap-6">
              <CheckInOutLists today={today} next3Days={data.upcomingCheckInsAndOuts.next3Days} />
              <OccupancyByLocationCard locations={data.bedOccupancy} />
              <RecentActivitiesFeed />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
