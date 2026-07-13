using ABLMess.Api.Controllers;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using RequestModel = ABLMess.Api.Models.Request;

namespace ABLMess.Api.Tests;

public class HotelPlacementsControllerTests
{
    private static (HotelPlacementsController controller, AblMessDbContext db, User gsUser, RequestModel request) SetUp()
    {
        var db = TestDbFactory.Create();
        var crew = new User { FirstName = "Crew", LastName = "One", Email = "crew@x.com", UserType = UserType.Crew };
        var gs = new User { FirstName = "G", LastName = "S", Email = "gs@x.com", UserType = UserType.GS };
        db.Users.AddRange(crew, gs);
        var request = new RequestModel { User = crew, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 5), Status = RequestStatus.Requested };
        db.Requests.Add(request);
        db.SaveChanges();

        var controller = new HotelPlacementsController(db);
        TestAuthHelper.SetUser(controller, gs.Id, "GS");
        return (controller, db, gs, request);
    }

    [Fact]
    public async Task Create_LogsPlacement_AndMarksRequestPlaced()
    {
        var (controller, db, gs, request) = SetUp();

        var result = await controller.Create(new CreateHotelPlacementDto(request.Id, "Hotel X", "Somewhere", request.From, request.To, "room full"));

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var dto = Assert.IsType<HotelPlacementDto>(created.Value);
        Assert.Equal(gs.Id, dto.CreatedByUserId);

        var reloadedRequest = await db.Requests.FindAsync(request.Id);
        Assert.Equal(RequestStatus.Placed, reloadedRequest!.Status);
    }

    [Fact]
    public async Task Create_ReturnsNotFound_WhenRequestMissing()
    {
        var (controller, _, _, _) = SetUp();

        var result = await controller.Create(new CreateHotelPlacementDto(9999, "Hotel X", "Somewhere", new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 2), null));

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenRequestAlreadyResolved()
    {
        var (controller, db, _, request) = SetUp();
        request.Status = RequestStatus.Booked;
        await db.SaveChangesAsync();

        var result = await controller.Create(new CreateHotelPlacementDto(request.Id, "Hotel X", "Somewhere", request.From, request.To, null));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenToBeforeFrom()
    {
        var (controller, _, _, request) = SetUp();

        var result = await controller.Create(new CreateHotelPlacementDto(request.Id, "Hotel X", "Somewhere", new DateOnly(2026, 1, 5), new DateOnly(2026, 1, 1), null));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetAll_ReturnsAllPlacements()
    {
        var (controller, db, gs, request) = SetUp();
        db.HotelPlacements.Add(new HotelPlacement
        {
            RequestId = request.Id,
            HotelName = "Hotel X",
            HotelAddress = "Somewhere",
            From = request.From,
            To = request.To,
            CreatedByUserId = gs.Id,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var result = await controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<IEnumerable<HotelPlacementDto>>(ok.Value).ToList();
        Assert.Single(list);
    }
}
