using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Controllers;

[ApiController]
[Route("api/locations")]
[Authorize(Roles = "Admin,GS")]
public class LocationsController(AblMessDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<LocationDto>>> GetAll()
    {
        var locations = await db.Locations.ToListAsync();
        return Ok(locations.Select(l => new LocationDto(l.Id, l.LocationName, l.LocationAddress)));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LocationDto>> GetById(int id)
    {
        var location = await db.Locations.FindAsync(id);
        return location is null ? NotFound() : Ok(new LocationDto(location.Id, location.LocationName, location.LocationAddress));
    }

    [HttpPost]
    public async Task<ActionResult<LocationDto>> Create(CreateLocationDto dto)
    {
        var location = new Location
        {
            LocationName = dto.LocationName,
            LocationAddress = dto.LocationAddress,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Locations.Add(location);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = location.Id }, new LocationDto(location.Id, location.LocationName, location.LocationAddress));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<LocationDto>> Update(int id, CreateLocationDto dto)
    {
        var location = await db.Locations.FindAsync(id);
        if (location is null)
        {
            return NotFound();
        }

        location.LocationName = dto.LocationName;
        location.LocationAddress = dto.LocationAddress;
        location.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new LocationDto(location.Id, location.LocationName, location.LocationAddress));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var location = await db.Locations.FindAsync(id);
        if (location is null)
        {
            return NotFound();
        }

        db.Locations.Remove(location);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
