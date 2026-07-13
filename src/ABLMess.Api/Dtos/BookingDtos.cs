using ABLMess.Api.Models;

namespace ABLMess.Api.Dtos;

public record CreateRequestDto(DateOnly From, DateOnly To, string? Comment);

public record RequestDto(
    int Id,
    int UserId,
    DateOnly From,
    DateOnly To,
    RequestStatus Status,
    string? Comment,
    DateTime CreatedAt);

public record CreateBookingDto(int RequestId, int BedId, DateOnly From, DateOnly To);

public record BookingDto(
    int Id,
    int RequestId,
    int BedId,
    DateOnly From,
    DateOnly To,
    BookingStatus Status,
    DateTime CreatedAt);

public record CreateHotelPlacementDto(
    int RequestId,
    string HotelName,
    string HotelAddress,
    DateOnly From,
    DateOnly To,
    string? Notes);

public record HotelPlacementDto(
    int Id,
    int RequestId,
    string HotelName,
    string HotelAddress,
    DateOnly From,
    DateOnly To,
    string? Notes,
    int CreatedByUserId,
    DateTime CreatedAt);

public static class BookingMappingExtensions
{
    public static RequestDto ToDto(this Request r) => new(r.Id, r.UserId, r.From, r.To, r.Status, r.Comment, r.CreatedAt);

    public static BookingDto ToDto(this Models.Booking b) => new(b.Id, b.RequestId, b.BedId, b.From, b.To, b.Status, b.CreatedAt);

    public static HotelPlacementDto ToDto(this HotelPlacement h) =>
        new(h.Id, h.RequestId, h.HotelName, h.HotelAddress, h.From, h.To, h.Notes, h.CreatedByUserId, h.CreatedAt);
}
