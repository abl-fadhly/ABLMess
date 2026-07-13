using ABLMess.Api.BookingLogic;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Controllers;

[ApiController]
[Route("api/rooms")]
[Authorize(Roles = "Admin,GS")]
public class RoomsController(AblMessDbContext db, RoomAvailabilityService availability) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<RoomDto>>> GetAll()
    {
        var rooms = await db.Rooms.Include(r => r.Beds).ToListAsync();

        var result = new List<RoomDto>();
        foreach (var room in rooms)
        {
            var status = await availability.GetRoomStatusAsync(room.Id);
            result.Add(new RoomDto(room.Id, room.RoomName, room.LocationId, status, room.Beds.Count));
        }

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoomDto>> GetById(int id)
    {
        var room = await db.Rooms.Include(r => r.Beds).FirstOrDefaultAsync(r => r.Id == id);
        if (room is null)
        {
            return NotFound();
        }

        var status = await availability.GetRoomStatusAsync(room.Id);
        return Ok(new RoomDto(room.Id, room.RoomName, room.LocationId, status, room.Beds.Count));
    }

    [HttpPost]
    public async Task<ActionResult<RoomDto>> Create(CreateRoomDto dto)
    {
        var locationExists = await db.Locations.AnyAsync(l => l.Id == dto.LocationId);
        if (!locationExists)
        {
            return BadRequest("Location not found.");
        }

        var room = new Room
        {
            RoomName = dto.RoomName,
            LocationId = dto.LocationId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Rooms.Add(room);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = room.Id }, new RoomDto(room.Id, room.RoomName, room.LocationId, RoomStatus.Empty, 0));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<RoomDto>> Update(int id, UpdateRoomDto dto)
    {
        var room = await db.Rooms.Include(r => r.Beds).FirstOrDefaultAsync(r => r.Id == id);
        if (room is null)
        {
            return NotFound();
        }

        var locationExists = await db.Locations.AnyAsync(l => l.Id == dto.LocationId);
        if (!locationExists)
        {
            return BadRequest("Location not found.");
        }

        room.RoomName = dto.RoomName;
        room.LocationId = dto.LocationId;
        room.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var status = await availability.GetRoomStatusAsync(room.Id);
        return Ok(new RoomDto(room.Id, room.RoomName, room.LocationId, status, room.Beds.Count));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var room = await db.Rooms.FindAsync(id);
        if (room is null)
        {
            return NotFound();
        }

        db.Rooms.Remove(room);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id:int}/beds")]
    public async Task<ActionResult<List<BedAvailabilityDto>>> GetBeds(int id, [FromQuery] DateOnly from, [FromQuery] DateOnly to)
    {
        if (to < from)
        {
            return BadRequest("to must not be before from.");
        }

        var beds = await db.Beds.Where(b => b.RoomId == id).ToListAsync();
        if (beds.Count == 0)
        {
            return NotFound("Room has no beds, or does not exist.");
        }

        var result = new List<BedAvailabilityDto>();
        foreach (var bed in beds)
        {
            var isAvailable = await availability.IsBedAvailableAsync(bed.Id, from, to);
            result.Add(new BedAvailabilityDto(bed.Id, bed.BedName, isAvailable));
        }

        return Ok(result);
    }

    [HttpGet("{id:int}/beds/list")]
    public async Task<ActionResult<List<BedDto>>> ListBeds(int id)
    {
        var roomExists = await db.Rooms.AnyAsync(r => r.Id == id);
        if (!roomExists)
        {
            return NotFound();
        }

        var beds = await db.Beds.Where(b => b.RoomId == id).ToListAsync();
        return Ok(beds.Select(b => new BedDto(b.Id, b.RoomId, b.BedName)));
    }

    [HttpPost("{id:int}/beds")]
    public async Task<ActionResult<BedDto>> CreateBed(int id, CreateBedDto dto)
    {
        var roomExists = await db.Rooms.AnyAsync(r => r.Id == id);
        if (!roomExists)
        {
            return NotFound("Room not found.");
        }

        var bed = new Bed
        {
            RoomId = id,
            BedName = dto.BedName,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Beds.Add(bed);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(ListBeds), new { id }, new BedDto(bed.Id, bed.RoomId, bed.BedName));
    }

    [HttpPut("{id:int}/beds/{bedId:int}")]
    public async Task<ActionResult<BedDto>> UpdateBed(int id, int bedId, UpdateBedDto dto)
    {
        var bed = await db.Beds.FirstOrDefaultAsync(b => b.Id == bedId && b.RoomId == id);
        if (bed is null)
        {
            return NotFound();
        }

        bed.BedName = dto.BedName;
        bed.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new BedDto(bed.Id, bed.RoomId, bed.BedName));
    }

    [HttpDelete("{id:int}/beds/{bedId:int}")]
    public async Task<IActionResult> DeleteBed(int id, int bedId)
    {
        var bed = await db.Beds.FirstOrDefaultAsync(b => b.Id == bedId && b.RoomId == id);
        if (bed is null)
        {
            return NotFound();
        }

        db.Beds.Remove(bed);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
