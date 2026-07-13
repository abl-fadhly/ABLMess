using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Controllers;

[ApiController]
[Route("api/ships")]
[Authorize(Roles = "Admin,GS")]
public class ShipsController(AblMessDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ShipDto>>> GetAll()
    {
        var ships = await db.Ships.ToListAsync();
        return Ok(ships.Select(s => new ShipDto(s.Id, s.ShipName)));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ShipDto>> GetById(int id)
    {
        var ship = await db.Ships.FindAsync(id);
        return ship is null ? NotFound() : Ok(new ShipDto(ship.Id, ship.ShipName));
    }

    [HttpPost]
    public async Task<ActionResult<ShipDto>> Create(CreateShipDto dto)
    {
        var ship = new Ship { ShipName = dto.ShipName };
        db.Ships.Add(ship);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = ship.Id }, new ShipDto(ship.Id, ship.ShipName));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ShipDto>> Update(int id, CreateShipDto dto)
    {
        var ship = await db.Ships.FindAsync(id);
        if (ship is null)
        {
            return NotFound();
        }

        ship.ShipName = dto.ShipName;
        await db.SaveChangesAsync();
        return Ok(new ShipDto(ship.Id, ship.ShipName));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ship = await db.Ships.FindAsync(id);
        if (ship is null)
        {
            return NotFound();
        }

        db.Ships.Remove(ship);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
