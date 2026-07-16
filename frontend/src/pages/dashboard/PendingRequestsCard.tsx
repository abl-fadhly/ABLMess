import { useState } from 'react'
import { Avatar, Card, CardLink, IconCircle, Menu, MenuItem, Table, Td, Th, Tr } from '../../components/ui'
import { Icon, iconPaths } from '../../components/icons'
import { EmptyState } from '../../components/Status'
import { BookModal } from '../../components/BookModal'
import { PlaceModal } from '../../components/PlaceModal'
import { useToast } from '../../components/ToastContext'
import type { PendingRequestDto } from '../../api/types'

const MAX_ROWS = 5

export function PendingRequestsCard({ requests, onChanged }: { requests: PendingRequestDto[]; onChanged: () => void }) {
  const [bookingFor, setBookingFor] = useState<PendingRequestDto | null>(null)
  const [placingFor, setPlacingFor] = useState<PendingRequestDto | null>(null)
  const toast = useToast()
  const visible = requests.slice(0, MAX_ROWS)

  return (
    <Card
      title={
        <>
          <IconCircle tone="primary" size="sm">
            <Icon path={iconPaths.clipboard} />
          </IconCircle>
          Pending Room Requests ({requests.length})
        </>
      }
      action={<CardLink to="/requests">View all</CardLink>}
    >
      {requests.length === 0 ? (
        <EmptyState message="No pending requests." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Crew</Th>
              <Th>Requested Stay</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <Tr key={r.requestId}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={r.userFullName} photoUrl={r.userPhotoUrl} />
                    <div className="min-w-0">
                      <p className="text-base font-medium text-neutral-900 truncate">{r.userFullName}</p>
                      <p className="text-xs text-neutral-500">ID: {r.userEmployeeCode}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  {r.from} → {r.to}
                </Td>
                <Td>
                  <Menu label="Assign Room">
                    <MenuItem onClick={() => setBookingFor(r)}>Book</MenuItem>
                    <MenuItem onClick={() => setPlacingFor(r)}>Place in Hotel</MenuItem>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {bookingFor && (
        <BookModal
          requestId={bookingFor.requestId}
          from={bookingFor.from}
          to={bookingFor.to}
          onClose={() => setBookingFor(null)}
          onDone={() => {
            setBookingFor(null)
            toast.success('Bed booked.')
            onChanged()
          }}
        />
      )}

      {placingFor && (
        <PlaceModal
          requestId={placingFor.requestId}
          from={placingFor.from}
          to={placingFor.to}
          onClose={() => setPlacingFor(null)}
          onDone={() => {
            setPlacingFor(null)
            toast.success('Hotel placement logged.')
            onChanged()
          }}
        />
      )}
    </Card>
  )
}
