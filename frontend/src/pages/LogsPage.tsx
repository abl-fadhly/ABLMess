import { useMemo, useState } from 'react'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { useBedIndex, type BedInfo } from '../hooks/useBedIndex'
import { Spinner, ErrorBanner, EmptyState } from '../components/Status'
import { Badge, Card, PageHeader, Select, Table, Td, Th, Tr } from '../components/ui'
import type {
  BookingDto,
  BookingStatus,
  HotelPlacementDto,
  RequestDto,
  RequestStatus,
  RoomDto,
  UserDto,
} from '../api/types'

type Tab = 'crew' | 'rooms' | 'hotels'

const requestStatusTone: Record<RequestStatus, 'warning' | 'success' | 'info' | 'neutral'> = {
  Requested: 'warning',
  Booked: 'success',
  Placed: 'info',
  Cancelled: 'neutral',
}

const bookingStatusTone: Record<BookingStatus, 'warning' | 'success' | 'neutral' | 'error'> = {
  Booked: 'warning',
  ClockIn: 'success',
  ClockOut: 'neutral',
  Cancelled: 'error',
}

function CrewLogTab({
  users,
  requests,
  bookings,
  bedIndex,
}: {
  users: UserDto[]
  requests: RequestDto[]
  bookings: BookingDto[]
  bedIndex: Map<number, BedInfo>
}) {
  const crew = users.filter((u) => u.userType === 'Crew')
  const [userId, setUserId] = useState<number | ''>('')

  const rows = useMemo(() => {
    if (userId === '') return []
    return requests
      .filter((r) => r.userId === userId)
      .map((r) => ({ request: r, booking: bookings.find((b) => b.requestId === r.id) ?? null }))
      .sort((a, b) => b.request.createdAt.localeCompare(a.request.createdAt))
  }, [userId, requests, bookings])

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Select value={userId} onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Select a crew member</option>
          {crew.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName} {u.lastName}
            </option>
          ))}
        </Select>
      </div>

      {userId === '' && <EmptyState message="Pick a crew member to see their request and booking history." />}
      {userId !== '' && rows.length === 0 && <EmptyState message="No history for this crew member yet." />}
      {rows.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Request #</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Request Status</Th>
              <Th>Bed</Th>
              <Th>Booking Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ request, booking }) => (
              <Tr key={request.id}>
                <Td>{request.id}</Td>
                <Td>{request.from}</Td>
                <Td>{request.to}</Td>
                <Td>
                  <Badge tone={requestStatusTone[request.status]}>{request.status}</Badge>
                </Td>
                <Td>{booking ? `${bedIndex.get(booking.bedId)?.roomName ?? '?'} / ${bedIndex.get(booking.bedId)?.bedName ?? `#${booking.bedId}`}` : '—'}</Td>
                <Td>{booking ? <Badge tone={bookingStatusTone[booking.status]}>{booking.status}</Badge> : '—'}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}

function RoomLogTab({
  rooms,
  bookings,
  users,
  requests,
  bedIndex,
}: {
  rooms: RoomDto[]
  bookings: BookingDto[]
  users: UserDto[]
  requests: RequestDto[]
  bedIndex: Map<number, BedInfo>
}) {
  const [roomId, setRoomId] = useState<number | ''>('')

  const rows = useMemo(() => {
    if (roomId === '') return []
    return bookings
      .filter((b) => bedIndex.get(b.bedId)?.roomId === roomId)
      .map((b) => {
        const request = requests.find((r) => r.id === b.requestId) ?? null
        const user = request ? users.find((u) => u.id === request.userId) ?? null : null
        return { booking: b, user }
      })
      .sort((a, b) => b.booking.createdAt.localeCompare(a.booking.createdAt))
  }, [roomId, bookings, bedIndex, requests, users])

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Select value={roomId} onChange={(e) => setRoomId(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Select a room</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.roomName}
            </option>
          ))}
        </Select>
      </div>

      {roomId === '' && <EmptyState message="Pick a room to see its booking history." />}
      {roomId !== '' && rows.length === 0 && <EmptyState message="No bookings logged for this room yet." />}
      {rows.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Bed</Th>
              <Th>Crew</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ booking, user }) => (
              <Tr key={booking.id}>
                <Td>{bedIndex.get(booking.bedId)?.bedName ?? `#${booking.bedId}`}</Td>
                <Td>{user ? `${user.firstName} ${user.lastName}` : '—'}</Td>
                <Td>{booking.from}</Td>
                <Td>{booking.to}</Td>
                <Td>
                  <Badge tone={bookingStatusTone[booking.status]}>{booking.status}</Badge>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}

function HotelPlacementsTab({
  placements,
  loading,
  error,
  users,
  requests,
}: {
  placements: HotelPlacementDto[] | null
  loading: boolean
  error: string | null
  users: UserDto[]
  requests: RequestDto[]
}) {
  return (
    <div>
      {loading && <Spinner label="Loading hotel placements..." />}
      {error && <ErrorBanner message={error} />}
      {placements && placements.length === 0 && <EmptyState message="No outside hotel placements logged yet." />}
      {placements && placements.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Crew</Th>
              <Th>Hotel</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Notes</Th>
              <Th>Logged</Th>
            </tr>
          </thead>
          <tbody>
            {placements.map((p) => {
              const request = requests.find((r) => r.id === p.requestId) ?? null
              const user = request ? users.find((u) => u.id === request.userId) ?? null : null
              return (
                <Tr key={p.id}>
                  <Td>{user ? `${user.firstName} ${user.lastName}` : '—'}</Td>
                  <Td>
                    {p.hotelName}
                    <span className="text-neutral-400"> — {p.hotelAddress}</span>
                  </Td>
                  <Td>{p.from}</Td>
                  <Td>{p.to}</Td>
                  <Td>{p.notes ?? '—'}</Td>
                  <Td className="text-neutral-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</Td>
                </Tr>
              )
            })}
          </tbody>
        </Table>
      )}
    </div>
  )
}

export function LogsPage() {
  const [tab, setTab] = useState<Tab>('crew')

  const { data: users, loading: usersLoading, error: usersError } = useFetch(() => api.get<UserDto[]>('/users'))
  const { data: requests, loading: requestsLoading, error: requestsError } = useFetch(() =>
    api.get<RequestDto[]>('/requests'),
  )
  const { data: bookings, loading: bookingsLoading, error: bookingsError } = useFetch(() =>
    api.get<BookingDto[]>('/bookings'),
  )
  const { data: rooms, loading: roomsLoading, error: roomsError } = useFetch(() => api.get<RoomDto[]>('/rooms'))
  const { data: placements, loading: placementsLoading, error: placementsError } = useFetch(() =>
    api.get<HotelPlacementDto[]>('/hotel-placements'),
  )
  const bedIndex = useBedIndex(rooms)

  const loading = usersLoading || requestsLoading || bookingsLoading || roomsLoading
  const error = usersError || requestsError || bookingsError || roomsError

  const tabs: { key: Tab; label: string }[] = [
    { key: 'crew', label: 'Crew Logs' },
    { key: 'rooms', label: 'Room Logs' },
    { key: 'hotels', label: 'Hotel Placements' },
  ]

  return (
    <div>
      <PageHeader title="Logs" subtitle="History of crew requests, room bookings, and outside hotel placements" />

      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              tab === t.key ? 'bg-secondary-600 text-white' : 'text-neutral-600 hover:bg-neutral-200/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {loading && <Spinner label="Loading logs..." />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && users && requests && bookings && rooms && (
          <>
            {tab === 'crew' && (
              <CrewLogTab users={users} requests={requests} bookings={bookings} bedIndex={bedIndex} />
            )}
            {tab === 'rooms' && (
              <RoomLogTab rooms={rooms} bookings={bookings} users={users} requests={requests} bedIndex={bedIndex} />
            )}
            {tab === 'hotels' && (
              <HotelPlacementsTab
                placements={placements}
                loading={placementsLoading}
                error={placementsError}
                users={users}
                requests={requests}
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}
