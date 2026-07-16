using System.Security.Claims;
using ABLMess.Api.Audit;
using ABLMess.Api.BookingLogic;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using ABLMess.Api.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingModel = ABLMess.Api.Models.Booking;
using BookingStatus = ABLMess.Api.Models.BookingStatus;
using RequestStatus = ABLMess.Api.Models.RequestStatus;

namespace ABLMess.Api.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize(Roles = "Admin,GS")]
public class BookingsController(AblMessDbContext db, RoomAvailabilityService availability, NotificationService notifications, AuditLogService auditLog) : ControllerBase
{
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create(CreateBookingDto dto)
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

        var bed = await db.Beds.FindAsync(dto.BedId);
        if (bed is null)
        {
            return NotFound("Bed not found.");
        }

        if (!await availability.IsBedAvailableAsync(dto.BedId, dto.From, dto.To))
        {
            return Conflict("Bed is already booked for an overlapping date range.");
        }

        var booking = new BookingModel
        {
            RequestId = dto.RequestId,
            BedId = dto.BedId,
            From = dto.From,
            To = dto.To,
            Status = BookingStatus.Booked,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Bookings.Add(booking);
        request.Status = RequestStatus.Booked;
        request.UpdatedAt = DateTime.UtcNow;
        auditLog.Log(AuditActionType.Booked, "Booked into a room", actorUserId: CurrentUserId, subjectUserId: request.UserId);
        await db.SaveChangesAsync();

        await notifications.NotifyRequestBookedAsync(request.Id);

        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking.ToDto());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookingDto>> GetById(int id)
    {
        var booking = await db.Bookings.FindAsync(id);
        return booking is null ? NotFound() : Ok(booking.ToDto());
    }

    [HttpGet]
    public async Task<ActionResult<List<BookingDto>>> GetAll()
    {
        var bookings = await db.Bookings.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return Ok(bookings.Select(b => b.ToDto()));
    }

    [HttpPut("{id:int}/check-in")]
    public async Task<IActionResult> CheckIn(int id)
    {
        var booking = await db.Bookings.FindAsync(id);
        if (booking is null)
        {
            return NotFound();
        }
        if (booking.Status != BookingStatus.Booked)
        {
            return BadRequest($"Booking must be Booked to check in (currently {booking.Status}).");
        }

        booking.Status = BookingStatus.CheckedIn;
        booking.UpdatedAt = DateTime.UtcNow;
        var checkInRequest = await db.Requests.FindAsync(booking.RequestId);
        auditLog.Log(AuditActionType.CheckedIn, "Checked in", actorUserId: CurrentUserId, subjectUserId: checkInRequest?.UserId);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:int}/check-out")]
    public async Task<IActionResult> CheckOut(int id)
    {
        var booking = await db.Bookings.FindAsync(id);
        if (booking is null)
        {
            return NotFound();
        }
        if (booking.Status != BookingStatus.CheckedIn)
        {
            return BadRequest($"Booking must be Checked-In to check out (currently {booking.Status}).");
        }

        booking.Status = BookingStatus.CheckedOut;
        booking.UpdatedAt = DateTime.UtcNow;
        var checkOutRequest = await db.Requests.FindAsync(booking.RequestId);
        auditLog.Log(AuditActionType.CheckedOut, "Checked out", actorUserId: CurrentUserId, subjectUserId: checkOutRequest?.UserId);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var booking = await db.Bookings.FindAsync(id);
        if (booking is null)
        {
            return NotFound();
        }
        if (booking.Status is BookingStatus.CheckedOut or BookingStatus.Cancelled)
        {
            return BadRequest($"Booking cannot be cancelled from status {booking.Status}.");
        }

        booking.Status = BookingStatus.Cancelled;
        booking.UpdatedAt = DateTime.UtcNow;

        var request = await db.Requests.FindAsync(booking.RequestId);
        if (request is not null)
        {
            request.Status = RequestStatus.Cancelled;
            request.UpdatedAt = DateTime.UtcNow;
        }

        auditLog.Log(AuditActionType.BookingCancelled, "Booking cancelled", actorUserId: CurrentUserId, subjectUserId: request?.UserId);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
