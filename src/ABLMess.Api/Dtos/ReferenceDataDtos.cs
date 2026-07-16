using ABLMess.Api.Models;

namespace ABLMess.Api.Dtos;

public record ShipDto(int Id, string ShipName);
public record CreateShipDto(string ShipName);

public record JabatanDto(int Id, string NamaJabatan);
public record CreateJabatanDto(string NamaJabatan);

public record LocationDto(int Id, string LocationName, string LocationAddress, string? ImageUrl);
public record CreateLocationDto(string LocationName, string LocationAddress, string? ImageUrl);

public record CreateRoomDto(string RoomName, int LocationId);
public record UpdateRoomDto(string RoomName, int LocationId);

public record BedDto(int Id, int RoomId, string BedName, BedStatus Status);
public record CreateBedDto(string BedName);
public record UpdateBedDto(string BedName, BedStatus Status);
