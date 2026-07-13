using ABLMess.Api.Models;

namespace ABLMess.Api.Dtos;

public record LocationOccupancyDto(int LocationId, string LocationName, int EmptyRooms, int OccupiedRooms, int FullRooms);

public record UpcomingBookingDto(int BookingId, int RequestId, int UserId, string UserFullName, DateOnly Date, string Kind);

public record PendingRequestDto(int RequestId, int UserId, string UserFullName, DateOnly From, DateOnly To, RequestStatus Status);

public record ActiveHotelPlacementDto(int PlacementId, int RequestId, int UserId, string UserFullName, string HotelName, DateOnly From, DateOnly To);

public record UpcomingCheckInsOutsDto(
    List<UpcomingBookingDto> Tomorrow,
    List<UpcomingBookingDto> Next3Days,
    List<UpcomingBookingDto> Next7Days);

public record DashboardDto(
    List<LocationOccupancyDto> Occupancy,
    UpcomingCheckInsOutsDto UpcomingCheckInsAndOuts,
    List<PendingRequestDto> PendingRequests,
    List<ActiveHotelPlacementDto> CrewInOutsideHotels);
