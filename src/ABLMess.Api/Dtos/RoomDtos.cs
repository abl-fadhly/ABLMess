using ABLMess.Api.Models;

namespace ABLMess.Api.Dtos;

public record RoomDto(int Id, string RoomName, int LocationId, RoomStatus Status, int BedCount);

public record BedAvailabilityDto(int Id, string BedName, bool IsAvailable, BedStatus Status);

public record RoomWithBedsDto(int Id, string RoomName, RoomStatus Status, List<BedAvailabilityDto> Beds);
