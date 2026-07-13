using ABLMess.Api.BookingLogic;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
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
public class BookingsController(AblMessDbContext db, RoomAvailabilityService availability, NotificationService notifications) : ControllerBase
{
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

    [HttpPut("{id:int}/clock-in")]
    public async Task<IActionResult> ClockIn(int id)
    {
        var booking = await db.Bookings.FindAsync(id);
        if (booking is null)
        {
            return NotFound();
        }
        if (booking.Status != BookingStatus.Booked)
        {
            return BadRequest($"Booking must be Booked to clock in (currently {booking.Status}).");
        }

        booking.Status = BookingStatus.ClockIn;
        booking.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:int}/clock-out")]
    public async Task<IActionResult> ClockOut(int id)
    {
        var booking = await db.Bookings.FindAsync(id);
        if (booking is null)
        {
            return NotFound();
        }
        if (booking.Status != BookingStatus.ClockIn)
        {
            return BadRequest($"Booking must be Clock-In to clock out (currently {booking.Status}).");
        }

        booking.Status = BookingStatus.ClockOut;
        booking.UpdatedAt = DateTime.UtcNow;
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
        if (booking.Status is BookingStatus.ClockOut or BookingStatus.Cancelled)
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

        await db.SaveChangesAsync();
        return NoContent();
    }
}
