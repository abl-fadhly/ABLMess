using System.Security.Claims;
using ABLMess.Api.Audit;
using ABLMess.Api.Controllers;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using RequestModel = ABLMess.Api.Models.Request;

namespace ABLMess.Api.Tests;

public class RequestsControllerTests
{
    private static RequestsController BuildController(AblMessDbContext db, int userId, string role)
    {
        var controller = new RequestsController(db, new AuditLogService(db));
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Role, role)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
        return controller;
    }

    private static (AblMessDbContext db, User crew) SeedCrew()
    {
        var db = TestDbFactory.Create();
        var crew = new User { FirstName = "Crew", LastName = "One", Email = "crew@x.com", UserType = UserType.Crew };
        db.Users.Add(crew);
        db.SaveChanges();
        return (db, crew);
    }

    [Fact]
    public async Task Create_CreatesRequestedRequest_ForCurrentUser()
    {
        var (db, crew) = SeedCrew();
        var controller = BuildController(db, crew.Id, "Crew");

        var result = await controller.Create(new CreateRequestDto(new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 5), "please"));

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var dto = Assert.IsType<RequestDto>(created.Value);
        Assert.Equal(crew.Id, dto.UserId);
        Assert.Equal(RequestStatus.Requested, dto.Status);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenToBeforeFrom()
    {
        var (db, crew) = SeedCrew();
        var controller = BuildController(db, crew.Id, "Crew");

        var result = await controller.Create(new CreateRequestDto(new DateOnly(2026, 1, 5), new DateOnly(2026, 1, 1), null));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Cancel_AllowsOwnerToCancelPendingRequest()
    {
        var (db, crew) = SeedCrew();
        var request = new RequestModel { User = crew, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 5), Status = RequestStatus.Requested };
        db.Requests.Add(request);
        await db.SaveChangesAsync();
        var controller = BuildController(db, crew.Id, "Crew");

        var result = await controller.Cancel(request.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.Equal(RequestStatus.Cancelled, (await db.Requests.FindAsync(request.Id))!.Status);
    }

    [Fact]
    public async Task Cancel_ForbidsNonOwnerCrew()
    {
        var (db, crew) = SeedCrew();
        var otherCrew = new User { FirstName = "Other", LastName = "Crew", Email = "other@x.com", UserType = UserType.Crew };
        db.Users.Add(otherCrew);
        var request = new RequestModel { User = crew, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 5), Status = RequestStatus.Requested };
        db.Requests.Add(request);
        await db.SaveChangesAsync();
        var controller = BuildController(db, otherCrew.Id, "Crew");

        var result = await controller.Cancel(request.Id);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task Cancel_AllowsGsToCancelAnyPendingRequest()
    {
        var (db, crew) = SeedCrew();
        var gs = new User { FirstName = "G", LastName = "S", Email = "gs@x.com", UserType = UserType.GS };
        db.Users.Add(gs);
        var request = new RequestModel { User = crew, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 5), Status = RequestStatus.Requested };
        db.Requests.Add(request);
        await db.SaveChangesAsync();
        var controller = BuildController(db, gs.Id, "GS");

        var result = await controller.Cancel(request.Id);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Cancel_Fails_WhenRequestAlreadyBooked()
    {
        var (db, crew) = SeedCrew();
        var request = new RequestModel { User = crew, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 5), Status = RequestStatus.Booked };
        db.Requests.Add(request);
        await db.SaveChangesAsync();
        var controller = BuildController(db, crew.Id, "Crew");

        var result = await controller.Cancel(request.Id);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task GetMine_ReturnsOnlyOwnRequests()
    {
        var (db, crew) = SeedCrew();
        var otherCrew = new User { FirstName = "Other", LastName = "Crew", Email = "other@x.com", UserType = UserType.Crew };
        db.Users.Add(otherCrew);
        db.Requests.Add(new RequestModel { User = crew, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 5), Status = RequestStatus.Requested });
        db.Requests.Add(new RequestModel { User = otherCrew, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 5), Status = RequestStatus.Requested });
        await db.SaveChangesAsync();
        var controller = BuildController(db, crew.Id, "Crew");

        var result = await controller.GetMine();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<IEnumerable<RequestDto>>(ok.Value).ToList();
        Assert.Single(list);
        Assert.Equal(crew.Id, list[0].UserId);
    }
}
