export type UserType = 'Admin' | 'GS' | 'Crew'
export type Gender = 'Male' | 'Female'
export type RoomStatus = 'Empty' | 'Occupied' | 'Full'
export type RequestStatus = 'Requested' | 'Booked' | 'Placed' | 'Cancelled'
export type BookingStatus = 'Booked' | 'CheckedIn' | 'CheckedOut' | 'Cancelled'
export type BedStatus = 'Available' | 'Occupied' | 'Maintenance'
export type AuditActionType =
  | 'RequestCreated'
  | 'RequestCancelled'
  | 'Booked'
  | 'CheckedIn'
  | 'CheckedOut'
  | 'BookingCancelled'
  | 'HotelPlacementCreated'
  | 'RoomCreated'
  | 'RoomUpdated'
  | 'BedStatusChanged'

export interface UserDto {
  id: number
  firstName: string
  lastName: string
  gender: Gender
  shipId: number | null
  jabatanId: number | null
  phone: string
  userType: UserType
  email: string
  employeeCode: string
  photoUrl: string | null
}

export interface LoginResponse {
  token: string
  user: UserDto
}

export interface RequestDto {
  id: number
  userId: number
  from: string
  to: string
  status: RequestStatus
  comment: string | null
  createdAt: string
}

export interface BookingDto {
  id: number
  requestId: number
  bedId: number
  from: string
  to: string
  status: BookingStatus
  createdAt: string
}

export interface HotelPlacementDto {
  id: number
  requestId: number
  hotelName: string
  hotelAddress: string
  from: string
  to: string
  notes: string | null
  createdByUserId: number
  createdAt: string
}

export interface RoomDto {
  id: number
  roomName: string
  locationId: number
  status: RoomStatus
  bedCount: number
}

export interface BedDto {
  id: number
  roomId: number
  bedName: string
  status: BedStatus
}

export interface BedAvailabilityDto {
  id: number
  bedName: string
  isAvailable: boolean
  status: BedStatus
}

export interface RoomWithBedsDto {
  id: number
  roomName: string
  status: RoomStatus
  beds: BedAvailabilityDto[]
}

export interface ShipDto {
  id: number
  shipName: string
}

export interface JabatanDto {
  id: number
  namaJabatan: string
}

export interface LocationDto {
  id: number
  locationName: string
  locationAddress: string
  imageUrl: string | null
}

export interface UpcomingBookingDto {
  bookingId: number
  requestId: number
  userId: number
  userFullName: string
  date: string
  kind: 'CheckIn' | 'CheckOut'
  roomName: string
  bedName: string
  locationName: string
}

export interface PendingRequestDto {
  requestId: number
  userId: number
  userFullName: string
  userEmployeeCode: string
  userPhotoUrl: string | null
  from: string
  to: string
  status: RequestStatus
}

export interface ActiveHotelPlacementDto {
  placementId: number
  requestId: number
  userId: number
  userFullName: string
  userEmployeeCode: string
  userPhotoUrl: string | null
  hotelName: string
  reason: string | null
  from: string
  to: string
}

export interface LocationOccupancyDto {
  locationId: number
  locationName: string
  emptyRooms: number
  occupiedRooms: number
  fullRooms: number
}

export interface LocationBedOccupancyDto {
  locationId: number
  locationName: string
  imageUrl: string | null
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  maintenanceBeds: number
}

export interface DashboardStatsDto {
  pendingRequestsCount: number
  availableBedsCount: number
  totalBedsCount: number
  occupancyRatePercent: number
  checkInTodayCount: number
  checkOutTodayCount: number
  hotelPlacementCount: number
}

export interface ActivityDto {
  id: number
  actionType: AuditActionType
  description: string
  actorUserFullName: string | null
  subjectUserFullName: string | null
  createdAt: string
}

export interface DashboardDto {
  stats: DashboardStatsDto
  occupancy: LocationOccupancyDto[]
  bedOccupancy: LocationBedOccupancyDto[]
  upcomingCheckInsAndOuts: {
    tomorrow: UpcomingBookingDto[]
    next3Days: UpcomingBookingDto[]
    next7Days: UpcomingBookingDto[]
  }
  pendingRequests: PendingRequestDto[]
  crewInOutsideHotels: ActiveHotelPlacementDto[]
}
