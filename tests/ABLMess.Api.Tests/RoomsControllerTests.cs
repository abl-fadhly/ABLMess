using ABLMess.Api.Audit;
using ABLMess.Api.BookingLogic;
using ABLMess.Api.Controllers;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace ABLMess.Api.Tests;

public class RoomsControllerTests
{
    private static (RoomsController controller, AblMessDbContext db, Location location) SetUp()
    {
        var db = TestDbFactory.Create();
        var location = new Location { LocationName = "Dock A", LocationAddress = "Somewhere" };
        var gs = new User { FirstName = "G", LastName = "S", Email = "gs@x.com", UserType = UserType.GS };
        db.Locations.Add(location);
        db.Users.Add(gs);
        db.SaveChanges();

        var controller = new RoomsController(db, new RoomAvailabilityService(db), new AuditLogService(db));
        TestAuthHelper.SetUser(controller, gs.Id, "GS");
        return (controller, db, location);
    }

    [Fact]
    public async Task Create_AddsRoom_UnderGivenLocation()
    {
        var (controller, _, location) = SetUp();

        var result = await controller.Create(new CreateRoomDto("R1", location.Id));

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var dto = Assert.IsType<RoomDto>(created.Value);
        Assert.Equal("R1", dto.RoomName);
        Assert.Equal(location.Id, dto.LocationId);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenLocationMissing()
    {
        var (controller, _, _) = SetUp();

        var result = await controller.Create(new CreateRoomDto("R1", 9999));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetAll_ReflectsBedCountAndStatus()
    {
        var (controller, db, location) = SetUp();
        var room = new Room { RoomName = "R1", Location = location };
        db.Rooms.Add(room);
        db.Beds.Add(new Bed { BedName = "B1", Room = room });
        db.Beds.Add(new Bed { BedName = "B2", Room = room });
        await db.SaveChangesAsync();

        var result = await controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<IEnumerable<RoomDto>>(ok.Value).ToList();
        var dto = Assert.Single(list);
        Assert.Equal(2, dto.BedCount);
        Assert.Equal(RoomStatus.Empty, dto.Status);
    }

    [Fact]
    public async Task Delete_RemovesRoom()
    {
        var (controller, db, location) = SetUp();
        var room = new Room { RoomName = "R1", Location = location };
        db.Rooms.Add(room);
        await db.SaveChangesAsync();

        var result = await controller.Delete(room.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.Null(await db.Rooms.FindAsync(room.Id));
    }

    [Fact]
    public async Task CreateBed_AddsBedToRoom()
    {
        var (controller, db, location) = SetUp();
        var room = new Room { RoomName = "R1", Location = location };
        db.Rooms.Add(room);
        await db.SaveChangesAsync();

        var result = await controller.CreateBed(room.Id, new CreateBedDto("B1"));

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var dto = Assert.IsType<BedDto>(created.Value);
        Assert.Equal("B1", dto.BedName);
        Assert.Equal(room.Id, dto.RoomId);
    }

    [Fact]
    public async Task CreateBed_ReturnsNotFound_WhenRoomMissing()
    {
        var (controller, _, _) = SetUp();

        var result = await controller.CreateBed(9999, new CreateBedDto("B1"));

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task DeleteBed_RemovesBed()
    {
        var (controller, db, location) = SetUp();
        var room = new Room { RoomName = "R1", Location = location };
        var bed = new Bed { BedName = "B1", Room = room };
        db.Rooms.Add(room);
        db.Beds.Add(bed);
        await db.SaveChangesAsync();

        var result = await controller.DeleteBed(room.Id, bed.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.Null(await db.Beds.FindAsync(bed.Id));
    }

    [Fact]
    public async Task GetBeds_ReportsAvailabilityForDateRange()
    {
        var (controller, db, location) = SetUp();
        var room = new Room { RoomName = "R1", Location = location };
        var bed = new Bed { BedName = "B1", Room = room };
        db.Rooms.Add(room);
        db.Beds.Add(bed);
        await db.SaveChangesAsync();

        var result = await controller.GetBeds(room.Id, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 5));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<IEnumerable<BedAvailabilityDto>>(ok.Value).ToList();
        var dto = Assert.Single(list);
        Assert.True(dto.IsAvailable);
    }

    [Fact]
    public async Task GetBeds_ReturnsBadRequest_WhenToBeforeFrom()
    {
        var (controller, db, location) = SetUp();
        var room = new Room { RoomName = "R1", Location = location };
        db.Rooms.Add(room);
        db.Beds.Add(new Bed { BedName = "B1", Room = room });
        await db.SaveChangesAsync();

        var result = await controller.GetBeds(room.Id, new DateOnly(2026, 1, 5), new DateOnly(2026, 1, 1));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}
