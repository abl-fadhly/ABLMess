using System.Security.Claims;
using ABLMess.Api.Audit;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelPlacementModel = ABLMess.Api.Models.HotelPlacement;
using RequestStatus = ABLMess.Api.Models.RequestStatus;

namespace ABLMess.Api.Controllers;

[ApiController]
[Route("api/hotel-placements")]
[Authorize(Roles = "Admin,GS")]
public class HotelPlacementsController(AblMessDbContext db, AuditLogService auditLog) : ControllerBase
{
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<HotelPlacementDto>> Create(CreateHotelPlacementDto dto)
    {
        if (dto.To < dto.From)
        {
            return BadRequest("To date must not be before From date.");
        }

        var request = await db.Requests.FindAsync(dto.RequestId);
        if (request is null)
        {
            return NotFound("Request not found.");
        }
        if (request.Status != RequestStatus.Requested)
        {
            return BadRequest($"Request is already {request.Status}.");
        }

        var placement = new HotelPlacementModel
        {
            RequestId = dto.RequestId,
            HotelName = dto.HotelName,
            HotelAddress = dto.HotelAddress,
            From = dto.From,
            To = dto.To,
            Notes = dto.Notes,
            CreatedByUserId = CurrentUserId,
            CreatedAt = DateTime.UtcNow
        };

        db.HotelPlacements.Add(placement);
        request.Status = RequestStatus.Placed;
        request.UpdatedAt = DateTime.UtcNow;
        auditLog.Log(AuditActionType.HotelPlacementCreated, $"Placed at {dto.HotelName}", actorUserId: CurrentUserId, subjectUserId: request.UserId);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = placement.Id }, placement.ToDto());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<HotelPlacementDto>> GetById(int id)
    {
        var placement = await db.HotelPlacements.FindAsync(id);
        return placement is null ? NotFound() : Ok(placement.ToDto());
    }

    [HttpGet]
    public async Task<ActionResult<List<HotelPlacementDto>>> GetAll()
    {
        var placements = await db.HotelPlacements.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return Ok(placements.Select(p => p.ToDto()));
    }
}
