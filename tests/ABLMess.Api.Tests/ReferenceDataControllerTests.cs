using ABLMess.Api.Controllers;
using ABLMess.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace ABLMess.Api.Tests;

public class ShipsControllerTests
{
    [Fact]
    public async Task Create_Then_GetAll_ReturnsShip()
    {
        var db = TestDbFactory.Create();
        var controller = new ShipsController(db);

        var created = await controller.Create(new CreateShipDto("MV Example"));
        Assert.IsType<CreatedAtActionResult>(created.Result);

        var all = await controller.GetAll();
        var ok = Assert.IsType<OkObjectResult>(all.Result);
        var list = Assert.IsAssignableFrom<IEnumerable<ShipDto>>(ok.Value).ToList();
        Assert.Single(list);
        Assert.Equal("MV Example", list[0].ShipName);
    }

    [Fact]
    public async Task Update_ChangesName()
    {
        var db = TestDbFactory.Create();
        var controller = new ShipsController(db);
        var created = await controller.Create(new CreateShipDto("Old Name"));
        var id = ((ShipDto)((CreatedAtActionResult)created.Result!).Value!).Id;

        var updated = await controller.Update(id, new CreateShipDto("New Name"));

        var ok = Assert.IsType<OkObjectResult>(updated.Result);
        Assert.Equal("New Name", ((ShipDto)ok.Value!).ShipName);
    }

    [Fact]
    public async Task Delete_RemovesShip()
    {
        var db = TestDbFactory.Create();
        var controller = new ShipsController(db);
        var created = await controller.Create(new CreateShipDto("To Delete"));
        var id = ((ShipDto)((CreatedAtActionResult)created.Result!).Value!).Id;

        var result = await controller.Delete(id);

        Assert.IsType<NoContentResult>(result);
        Assert.IsType<NotFoundResult>((await controller.GetById(id)).Result);
    }
}

public class JabatansControllerTests
{
    [Fact]
    public async Task Create_Then_GetAll_ReturnsJabatan()
    {
        var db = TestDbFactory.Create();
        var controller = new JabatansController(db);

        await controller.Create(new CreateJabatanDto("Kapten"));

        var all = await controller.GetAll();
        var ok = Assert.IsType<OkObjectResult>(all.Result);
        var list = Assert.IsAssignableFrom<IEnumerable<JabatanDto>>(ok.Value).ToList();
        Assert.Single(list);
        Assert.Equal("Kapten", list[0].NamaJabatan);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_ForMissingId()
    {
        var db = TestDbFactory.Create();
        var controller = new JabatansController(db);

        var result = await controller.Delete(9999);

        Assert.IsType<NotFoundResult>(result);
    }
}

public class LocationsControllerTests
{
    [Fact]
    public async Task Create_Then_GetAll_ReturnsLocation()
    {
        var db = TestDbFactory.Create();
        var controller = new LocationsController(db);

        await controller.Create(new CreateLocationDto("Dock A", "123 Harbor Rd"));

        var all = await controller.GetAll();
        var ok = Assert.IsType<OkObjectResult>(all.Result);
        var list = Assert.IsAssignableFrom<IEnumerable<LocationDto>>(ok.Value).ToList();
        Assert.Single(list);
        Assert.Equal("Dock A", list[0].LocationName);
    }

    [Fact]
    public async Task Update_ChangesAddress()
    {
        var db = TestDbFactory.Create();
        var controller = new LocationsController(db);
        var created = await controller.Create(new CreateLocationDto("Dock A", "Old Address"));
        var id = ((LocationDto)((CreatedAtActionResult)created.Result!).Value!).Id;

        var updated = await controller.Update(id, new CreateLocationDto("Dock A", "New Address"));

        var ok = Assert.IsType<OkObjectResult>(updated.Result);
        Assert.Equal("New Address", ((LocationDto)ok.Value!).LocationAddress);
    }
}
