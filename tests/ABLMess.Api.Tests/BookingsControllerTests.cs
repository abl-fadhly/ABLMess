using ABLMess.Api.BookingLogic;
using ABLMess.Api.Controllers;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using ABLMess.Api.Notifications;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using BookingModel = ABLMess.Api.Models.Booking;

namespace ABLMess.Api.Tests;

public class BookingsControllerTests
{
    private static (BookingsController controller, AblMessDbContext db, User crew, Bed bed, Request request) SetUp()
    {
        var db = TestDbFactory.Create();

        var location = new Location { LocationName = "Dock A", LocationAddress = "Somewhere" };
        var room = new Room { RoomName = "R1", Location = location };
        var bed = new Bed { BedName = "B1", Room = room };
        db.Locations.Add(location);
        db.Rooms.Add(room);
        db.Beds.Add(bed);

        var crew = new User { FirstName = "Crew", LastName = "One", Email = "crew@x.com", UserType = UserType.Crew };
        db.Users.Add(crew);

        var request = new Request { User = crew, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 5), Status = RequestStatus.Requested };
        db.Requests.Add(request);
        db.SaveChanges();

        var availability = new RoomAvailabilityService(db);
        var notifications = new NotificationService(db, new FakeEmailSender());
        var controller = new BookingsController(db, availability, notifications);

        return (controller, db, crew, bed, request);
    }

    [Fact]
    public async Task Create_Succeeds_AndBooksRequest()
    {
        var (controller, db, _, bed, request) = SetUp();

        var result = await controller.Create(new CreateBookingDto(request.Id, bed.Id, request.From, request.To));

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var dto = Assert.IsType<BookingDto>(created.Value);
        Assert.Equal(BookingStatus.Booked, dto.Status);

        var reloadedRequest = await db.Requests.FindAsync(request.Id);
        Assert.Equal(RequestStatus.Booked, reloadedRequest!.Status);
    }

    [Fact]
    public async Task Create_ReturnsNotFound_WhenRequestMissing()
    {
        var (controller, _, _, bed, _) = SetUp();

        var result = await controller.Create(new CreateBookingDto(9999, bed.Id, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 2)));

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenRequestAlreadyBooked()
    {
        var (controller, db, _, bed, request) = SetUp();
        request.Status = RequestStatus.Booked;
        await db.SaveChangesAsync();

        var result = await controller.Create(new CreateBookingDto(request.Id, bed.Id, request.From, request.To));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsConflict_WhenBedAlreadyBookedForOverlappingDates()
    {
        var (controller, db, _, bed, request) = SetUp();
        db.Bookings.Add(new BookingModel { Request = request, Bed = bed, From = request.From, To = request.To, Status = BookingStatus.Booked });
        await db.SaveChangesAsync();

        // second request wanting the same bed for an overlapping range
        var otherRequest = new Request { User = request.User, From = request.From, To = request.To, Status = RequestStatus.Requested };
        db.Requests.Add(otherRequest);
        await db.SaveChangesAsync();

        var result = await controller.Create(new CreateBookingDto(otherRequest.Id, bed.Id, otherRequest.From, otherRequest.To));

        Assert.IsType<ConflictObjectResult>(result.Result);
    }

    [Fact]
    public async Task ClockIn_Succeeds_FromBookedStatus()
    {
        var (controller, db, _, bed, request) = SetUp();
        var booking = new BookingModel { Request = request, Bed = bed, From = request.From, To = request.To, Status = BookingStatus.Booked };
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();

        var result = await controller.ClockIn(booking.Id);

        Assert.IsType<NoContentResult>(result);
        var reloaded = await db.Bookings.FindAsync(booking.Id);
        Assert.Equal(BookingStatus.ClockIn, reloaded!.Status);
    }

    [Fact]
    public async Task ClockOut_Fails_WhenNotYetClockedIn()
    {
        var (controller, db, _, bed, request) = SetUp();
        var booking = new BookingModel { Request = request, Bed = bed, From = request.From, To = request.To, Status = BookingStatus.Booked };
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();

        var result = await controller.ClockOut(booking.Id);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Cancel_SetsBookingAndLinkedRequestToCancelled()
    {
        var (controller, db, _, bed, request) = SetUp();
        var booking = new BookingModel { Request = request, Bed = bed, From = request.From, To = request.To, Status = BookingStatus.Booked };
        db.Bookings.Add(booking);
        request.Status = RequestStatus.Booked;
        await db.SaveChangesAsync();

        var result = await controller.Cancel(booking.Id);

        Assert.IsType<NoContentResult>(result);
        var reloadedBooking = await db.Bookings.FindAsync(booking.Id);
        var reloadedRequest = await db.Requests.FindAsync(request.Id);
        Assert.Equal(BookingStatus.Cancelled, reloadedBooking!.Status);
        Assert.Equal(RequestStatus.Cancelled, reloadedRequest!.Status);
    }

    [Fact]
    public async Task Cancel_Fails_WhenAlreadyClockedOut()
    {
        var (controller, db, _, bed, request) = SetUp();
        var booking = new BookingModel { Request = request, Bed = bed, From = request.From, To = request.To, Status = BookingStatus.ClockOut };
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();

        var result = await controller.Cancel(booking.Id);

        Assert.IsType<BadRequestObjectResult>(result);
    }
}
