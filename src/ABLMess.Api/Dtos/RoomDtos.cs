using ABLMess.Api.Models;

namespace ABLMess.Api.Dtos;

public record RoomDto(int Id, string RoomName, int LocationId, RoomStatus Status, int BedCount);

public record BedAvailabilityDto(int Id, string BedName, bool IsAvailable);
