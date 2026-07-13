using System.Security.Claims;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RequestModel = ABLMess.Api.Models.Request;
using RequestStatus = ABLMess.Api.Models.RequestStatus;

namespace ABLMess.Api.Controllers;

[ApiController]
[Route("api/requests")]
[Authorize]
public class RequestsController(AblMessDbContext db) : ControllerBase
{
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    [Authorize(Roles = "Crew")]
    public async Task<ActionResult<RequestDto>> Create(CreateRequestDto dto)
    {
        if (dto.To < dto.From)
        {
            return BadRequest("To date must not be before From date.");
        }

        var request = new RequestModel
        {
            UserId = CurrentUserId,
            From = dto.From,
            To = dto.To,
            Comment = dto.Comment,
            Status = RequestStatus.Requested,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Requests.Add(request);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request.ToDto());
    }

    [HttpGet]
    [Authorize(Roles = "Admin,GS")]
    public async Task<ActionResult<List<RequestDto>>> GetAll()
    {
        var requests = await db.Requests.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return Ok(requests.Select(r => r.ToDto()));
    }

    [HttpGet("mine")]
    [Authorize(Roles = "Crew")]
    public async Task<ActionResult<List<RequestDto>>> GetMine()
    {
        var requests = await db.Requests
            .Where(r => r.UserId == CurrentUserId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
        return Ok(requests.Select(r => r.ToDto()));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,GS,Crew")]
    public async Task<ActionResult<RequestDto>> GetById(int id)
    {
        var request = await db.Requests.FindAsync(id);
        if (request is null)
        {
            return NotFound();
        }

        var isOwner = request.UserId == CurrentUserId;
        var isStaff = User.IsInRole("Admin") || User.IsInRole("GS");
        if (!isOwner && !isStaff)
        {
            return Forbid();
        }

        return Ok(request.ToDto());
    }

    [HttpPut("{id:int}/cancel")]
    [Authorize(Roles = "Admin,GS,Crew")]
    public async Task<IActionResult> Cancel(int id)
    {
        var request = await db.Requests.FindAsync(id);
        if (request is null)
        {
            return NotFound();
        }

        var isOwner = request.UserId == CurrentUserId;
        var isStaff = User.IsInRole("Admin") || User.IsInRole("GS");
        if (!isOwner && !isStaff)
        {
            return Forbid();
        }

        if (request.Status is RequestStatus.Booked or RequestStatus.Placed)
        {
            return BadRequest("Request is already booked or placed; cancel the linked booking/placement instead.");
        }

        request.Status = RequestStatus.Cancelled;
        request.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return NoContent();
    }
}
