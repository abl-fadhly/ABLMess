export type UserType = 'Admin' | 'GS' | 'Crew'
export type Gender = 'Male' | 'Female'
export type RoomStatus = 'Empty' | 'Occupied' | 'Full'
export type RequestStatus = 'Requested' | 'Booked' | 'Placed' | 'Cancelled'
export type BookingStatus = 'Booked' | 'ClockIn' | 'ClockOut' | 'Cancelled'

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
}

export interface BedAvailabilityDto {
  id: number
  bedName: string
  isAvailable: boolean
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
}

export interface UpcomingBookingDto {
  bookingId: number
  requestId: number
  userId: number
  userFullName: string
  date: string
  kind: 'ClockIn' | 'ClockOut'
}

export interface PendingRequestDto {
  requestId: number
  userId: number
  userFullName: string
  from: string
  to: string
  status: RequestStatus
}

export interface ActiveHotelPlacementDto {
  placementId: number
  requestId: number
  userId: number
  userFullName: string
  hotelName: string
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

export interface DashboardDto {
  occupancy: LocationOccupancyDto[]
  upcomingCheckInsAndOuts: {
    tomorrow: UpcomingBookingDto[]
    next3Days: UpcomingBookingDto[]
    next7Days: UpcomingBookingDto[]
  }
  pendingRequests: PendingRequestDto[]
  crewInOutsideHotels: ActiveHotelPlacementDto[]
}
