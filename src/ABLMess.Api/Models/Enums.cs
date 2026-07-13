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
    ClockIn,
    ClockOut,
    Cancelled
}
