namespace ABLMess.Api.Models;

public enum UserType
{
    Admin,
    GS,
    Crew
}

public enum Gender
{
    Male,
    Female
}

public enum RoomStatus
{
    Empty,
    Occupied,
    Full
}

public enum RequestStatus
{
    Requested,
    Booked,
    Placed,
    Cancelled
}

public enum BookingStatus
{
    Booked,
    CheckedIn,
    CheckedOut,
    Cancelled
}

public enum BedStatus
{
    Available,
    Occupied,
    Maintenance
}

public enum AuditActionType
{
    RequestCreated,
    RequestCancelled,
    Booked,
    CheckedIn,
    CheckedOut,
    BookingCancelled,
    HotelPlacementCreated,
    RoomCreated,
    RoomUpdated,
    BedStatusChanged
}
