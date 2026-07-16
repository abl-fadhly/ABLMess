using ABLMess.Api.BookingLogic;
using ABLMess.Api.Controllers;
using ABLMess.Api.Data;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using BookingModel = ABLMess.Api.Models.Booking;
using RequestModel = ABLMess.Api.Models.Request;

namespace ABLMess.Api.Tests;

public class DashboardControllerTests
{
    private static DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);

    private static (DashboardController controller, AblMessDbContext db, User crew) SetUp()
    {
        var db = TestDbFactory.Create();
        var crew = new User { FirstName = "Crew", LastName = "One", Email = "crew@x.com", UserType = UserType.Crew };
        db.Users.Add(crew);
        db.SaveChanges();

        var controller = new DashboardController(db, new RoomAvailabilityService(db));
        return (controller, db, crew);
    }

    [Fact]
    public async Task Get_ReportsOccupancyPerLocation()
    {
        var (controller, db, crew) = SetUp();
        var location = new Location { LocationName = "Dock A", LocationAddress = "Somewhere" };
        var room = new Room { RoomName = "R1", Location = location };
        var bed = new Bed { BedName = "B1", Room = room };
        db.Locations.Add(location);
        db.Rooms.Add(room);
        db.Beds.Add(bed);
        var request = new RequestModel { User = crew, From = Today, To = Today.AddDays(3), Status = RequestStatus.Booked };
        db.Requests.Add(request);
        db.Bookings.Add(new BookingModel { Request = request, Bed = bed, From = Today, To = Today.AddDays(3), Status = BookingStatus.Booked });
        await db.SaveChangesAsync();

        var result = await controller.Get();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<Dtos.DashboardDto>(ok.Value);
        var occupancy = Assert.Single(dto.Occupancy);
        Assert.Equal(1, occupancy.FullRooms);
        Assert.Equal(0, occupancy.EmptyRooms);
    }

    [Fact]
    public async Task Get_BucketsUpcomingCheckInsCorrectly()
    {
        var (controller, db, crew) = SetUp();
        var location = new Location { LocationName = "Dock A", LocationAddress = "Somewhere" };
        var room = new Room { RoomName = "R1", Location = location };
        var bed = new Bed { BedName = "B1", Room = room };
        db.Locations.Add(location);
        db.Rooms.Add(room);
        db.Beds.Add(bed);

        var tomorrowRequest = new RequestModel { User = crew, From = Today.AddDays(1), To = Today.AddDays(5), Status = RequestStatus.Booked };
        db.Requests.Add(tomorrowRequest);
        db.Bookings.Add(new BookingModel { Request = tomorrowRequest, Bed = bed, From = Today.AddDays(1), To = Today.AddDays(5), Status = BookingStatus.Booked });
        await db.SaveChangesAsync();

        var result = await controller.Get();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<Dtos.DashboardDto>(ok.Value);
        Assert.Single(dto.UpcomingCheckInsAndOuts.Tomorrow);
        Assert.Contains(dto.UpcomingCheckInsAndOuts.Next3Days, u => u.Kind == "CheckIn");
        Assert.Contains(dto.UpcomingCheckInsAndOuts.Next7Days, u => u.Kind == "CheckIn");
    }

    [Fact]
    public async Task Get_ListsPendingRequests()
    {
        var (controller, db, crew) = SetUp();
        db.Requests.Add(new RequestModel { User = crew, From = Today, To = Today.AddDays(2), Status = RequestStatus.Requested });
        await db.SaveChangesAsync();

        var result = await controller.Get();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<Dtos.DashboardDto>(ok.Value);
        Assert.Single(dto.PendingRequests);
    }

    [Fact]
    public async Task Get_ListsActiveHotelPlacements()
    {
        var (controller, db, crew) = SetUp();
        var request = new RequestModel { User = crew, From = Today, To = Today.AddDays(2), Status = RequestStatus.Placed };
        db.Requests.Add(request);
        db.HotelPlacements.Add(new HotelPlacement
        {
            Request = request,
            HotelName = "Hotel X",
            HotelAddress = "Somewhere",
            From = Today.AddDays(-1),
            To = Today.AddDays(1),
            CreatedByUserId = crew.Id,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var result = await controller.Get();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<Dtos.DashboardDto>(ok.Value);
        Assert.Single(dto.CrewInOutsideHotels);
    }

    [Fact]
    public async Task Get_ExcludesHotelPlacements_OutsideActiveDateRange()
    {
        var (controller, db, crew) = SetUp();
        var request = new RequestModel { User = crew, From = Today, To = Today.AddDays(2), Status = RequestStatus.Placed };
        db.Requests.Add(request);
        db.HotelPlacements.Add(new HotelPlacement
        {
            Request = request,
            HotelName = "Hotel X",
            HotelAddress = "Somewhere",
            From = Today.AddDays(10),
            To = Today.AddDays(12),
            CreatedByUserId = crew.Id,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var result = await controller.Get();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<Dtos.DashboardDto>(ok.Value);
        Assert.Empty(dto.CrewInOutsideHotels);
    }
}
