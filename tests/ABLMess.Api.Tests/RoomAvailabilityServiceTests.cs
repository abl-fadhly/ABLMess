using ABLMess.Api.BookingLogic;
using ABLMess.Api.Models;
using Xunit;

namespace ABLMess.Api.Tests;

public class RoomAvailabilityServiceTests
{
    private static (Room room, Bed bed1, Bed bed2) SeedRoomWithTwoBeds(Data.AblMessDbContext db)
    {
        var location = new Location { LocationName = "Dock A", LocationAddress = "Somewhere" };
        db.Locations.Add(location);
        var room = new Room { RoomName = "R1", Location = location };
        db.Rooms.Add(room);
        var bed1 = new Bed { BedName = "B1", Room = room };
        var bed2 = new Bed { BedName = "B2", Room = room };
        db.Beds.AddRange(bed1, bed2);
        db.SaveChanges();
        return (room, bed1, bed2);
    }

    private static Request SeedRequest(Data.AblMessDbContext db, DateOnly from, DateOnly to)
    {
        var user = new User { FirstName = "A", LastName = "B", Email = $"{Guid.NewGuid()}@x.com", UserType = UserType.Crew };
        db.Users.Add(user);
        var request = new Request { User = user, From = from, To = to, Status = RequestStatus.Requested };
        db.Requests.Add(request);
        db.SaveChanges();
        return request;
    }

    [Fact]
    public async Task IsBedAvailable_ReturnsTrue_WhenNoBookings()
    {
        var db = TestDbFactory.Create();
        var (_, bed1, _) = SeedRoomWithTwoBeds(db);
        var sut = new RoomAvailabilityService(db);

        var result = await sut.IsBedAvailableAsync(bed1.Id, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 5));

        Assert.True(result);
    }

    [Fact]
    public async Task IsBedAvailable_ReturnsFalse_WhenOverlappingActiveBookingExists()
    {
        var db = TestDbFactory.Create();
        var (_, bed1, _) = SeedRoomWithTwoBeds(db);
        var request = SeedRequest(db, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 10));
        db.Bookings.Add(new Booking { Request = request, Bed = bed1, From = new DateOnly(2026, 1, 3), To = new DateOnly(2026, 1, 8), Status = BookingStatus.Booked });
        await db.SaveChangesAsync();
        var sut = new RoomAvailabilityService(db);

        var result = await sut.IsBedAvailableAsync(bed1.Id, new DateOnly(2026, 1, 5), new DateOnly(2026, 1, 12));

        Assert.False(result);
    }

    [Theory]
    [InlineData(2026, 1, 1, 2026, 1, 2, true)]   // entirely before -> available
    [InlineData(2026, 1, 9, 2026, 1, 12, true)]  // entirely after -> available
    [InlineData(2026, 1, 3, 2026, 1, 8, false)]  // exact same range -> conflict
    [InlineData(2026, 1, 7, 2026, 1, 9, false)]  // tail overlap -> conflict
    [InlineData(2026, 1, 1, 2026, 1, 3, false)]  // touches start boundary (inclusive) -> conflict
    public async Task IsBedAvailable_HandlesDateRangeBoundariesCorrectly(int fy, int fm, int fd, int ty, int tm, int td, bool expectedAvailable)
    {
        var db = TestDbFactory.Create();
        var (_, bed1, _) = SeedRoomWithTwoBeds(db);
        var request = SeedRequest(db, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 10));
        db.Bookings.Add(new Booking { Request = request, Bed = bed1, From = new DateOnly(2026, 1, 3), To = new DateOnly(2026, 1, 8), Status = BookingStatus.Booked });
        await db.SaveChangesAsync();
        var sut = new RoomAvailabilityService(db);

        var result = await sut.IsBedAvailableAsync(bed1.Id, new DateOnly(fy, fm, fd), new DateOnly(ty, tm, td));

        Assert.Equal(expectedAvailable, result);
    }

    [Fact]
    public async Task IsBedAvailable_IgnoresCancelledBookings()
    {
        var db = TestDbFactory.Create();
        var (_, bed1, _) = SeedRoomWithTwoBeds(db);
        var request = SeedRequest(db, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 10));
        db.Bookings.Add(new Booking { Request = request, Bed = bed1, From = new DateOnly(2026, 1, 3), To = new DateOnly(2026, 1, 8), Status = BookingStatus.Cancelled });
        await db.SaveChangesAsync();
        var sut = new RoomAvailabilityService(db);

        var result = await sut.IsBedAvailableAsync(bed1.Id, new DateOnly(2026, 1, 3), new DateOnly(2026, 1, 8));

        Assert.True(result);
    }

    [Fact]
    public async Task IsBedAvailable_ExcludesGivenBookingId()
    {
        var db = TestDbFactory.Create();
        var (_, bed1, _) = SeedRoomWithTwoBeds(db);
        var request = SeedRequest(db, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 10));
        var booking = new Booking { Request = request, Bed = bed1, From = new DateOnly(2026, 1, 3), To = new DateOnly(2026, 1, 8), Status = BookingStatus.Booked };
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();
        var sut = new RoomAvailabilityService(db);

        var result = await sut.IsBedAvailableAsync(bed1.Id, new DateOnly(2026, 1, 3), new DateOnly(2026, 1, 8), excludeBookingId: booking.Id);

        Assert.True(result);
    }

    [Fact]
    public async Task GetRoomStatus_IsEmpty_WhenNoActiveBookingsToday()
    {
        var db = TestDbFactory.Create();
        var (room, _, _) = SeedRoomWithTwoBeds(db);
        var sut = new RoomAvailabilityService(db);

        var status = await sut.GetRoomStatusAsync(room.Id, new DateOnly(2026, 1, 5));

        Assert.Equal(RoomStatus.Empty, status);
    }

    [Fact]
    public async Task GetRoomStatus_IsOccupied_WhenSomeBedsBookedToday()
    {
        var db = TestDbFactory.Create();
        var (room, bed1, _) = SeedRoomWithTwoBeds(db);
        var request = SeedRequest(db, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 10));
        db.Bookings.Add(new Booking { Request = request, Bed = bed1, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 10), Status = BookingStatus.Booked });
        await db.SaveChangesAsync();
        var sut = new RoomAvailabilityService(db);

        var status = await sut.GetRoomStatusAsync(room.Id, new DateOnly(2026, 1, 5));

        Assert.Equal(RoomStatus.Occupied, status);
    }

    [Fact]
    public async Task GetRoomStatus_IsFull_WhenAllBedsBookedToday()
    {
        var db = TestDbFactory.Create();
        var (room, bed1, bed2) = SeedRoomWithTwoBeds(db);
        var request1 = SeedRequest(db, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 10));
        var request2 = SeedRequest(db, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 10));
        db.Bookings.Add(new Booking { Request = request1, Bed = bed1, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 10), Status = BookingStatus.Booked });
        db.Bookings.Add(new Booking { Request = request2, Bed = bed2, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 10), Status = BookingStatus.ClockIn });
        await db.SaveChangesAsync();
        var sut = new RoomAvailabilityService(db);

        var status = await sut.GetRoomStatusAsync(room.Id, new DateOnly(2026, 1, 5));

        Assert.Equal(RoomStatus.Full, status);
    }

    [Fact]
    public async Task GetRoomStatus_IgnoresBookingsOutsideAsOfDate()
    {
        var db = TestDbFactory.Create();
        var (room, bed1, _) = SeedRoomWithTwoBeds(db);
        var request = SeedRequest(db, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 10));
        db.Bookings.Add(new Booking { Request = request, Bed = bed1, From = new DateOnly(2026, 2, 1), To = new DateOnly(2026, 2, 10), Status = BookingStatus.Booked });
        await db.SaveChangesAsync();
        var sut = new RoomAvailabilityService(db);

        var status = await sut.GetRoomStatusAsync(room.Id, new DateOnly(2026, 1, 5));

        Assert.Equal(RoomStatus.Empty, status);
    }
}
