using ABLMess.Api.Models;

namespace ABLMess.Api.Dtos;

public record LocationOccupancyDto(int LocationId, string LocationName, int EmptyRooms, int OccupiedRooms, int FullRooms);

public record LocationBedOccupancyDto(
    int LocationId,
    string LocationName,
    string? ImageUrl,
    int TotalBeds,
    int OccupiedBeds,
    int AvailableBeds,
    int MaintenanceBeds);

public record UpcomingBookingDto(
    int BookingId,
    int RequestId,
    int UserId,
    string UserFullName,
    DateOnly Date,
    string Kind,
    string RoomName,
    string BedName,
    string LocationName);

public record PendingRequestDto(
    int RequestId,
    int UserId,
    string UserFullName,
    string UserEmployeeCode,
    string? UserPhotoUrl,
    DateOnly From,
    DateOnly To,
    RequestStatus Status);

public record ActiveHotelPlacementDto(
    int PlacementId,
    int RequestId,
    int UserId,
    string UserFullName,
    string UserEmployeeCode,
    string? UserPhotoUrl,
    string HotelName,
    string? Reason,
    DateOnly From,
    DateOnly To);

public record UpcomingCheckInsOutsDto(
    List<UpcomingBookingDto> Tomorrow,
    List<UpcomingBookingDto> Next3Days,
    List<UpcomingBookingDto> Next7Days);

public record DashboardStatsDto(
    int PendingRequestsCount,
    int AvailableBedsCount,
    int TotalBedsCount,
    double OccupancyRatePercent,
    int CheckInTodayCount,
    int CheckOutTodayCount,
    int HotelPlacementCount);

public record DashboardDto(
    DashboardStatsDto Stats,
    List<LocationOccupancyDto> Occupancy,
    List<LocationBedOccupancyDto> BedOccupancy,
    UpcomingCheckInsOutsDto UpcomingCheckInsAndOuts,
    List<PendingRequestDto> PendingRequests,
    List<ActiveHotelPlacementDto> CrewInOutsideHotels);
