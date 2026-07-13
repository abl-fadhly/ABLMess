using ABLMess.Api.BookingLogic;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "Admin,GS")]
public class DashboardController(AblMessDbContext db, RoomAvailabilityService availability) : ControllerBase
{
    private static readonly int WidestWindowDays = 7;

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var windowEnd = today.AddDays(WidestWindowDays);

        var occupancy = await GetOccupancyAsync();

        var upcoming = await db.Bookings
            .Include(b => b.Request)
            .ThenInclude(r => r!.User)
            .Where(b => b.Status == BookingStatus.Booked || b.Status == BookingStatus.ClockIn)
            .Where(b => (b.From >= today && b.From <= windowEnd) || (b.To >= today && b.To <= windowEnd))
            .ToListAsync();

        var upcomingDtos = new List<UpcomingBookingDto>();
        foreach (var b in upcoming)
        {
            var user = b.Request!.User!;
            var fullName = $"{user.FirstName} {user.LastName}";

            if (b.Status == BookingStatus.Booked && b.From >= today && b.From <= windowEnd)
            {
                upcomingDtos.Add(new UpcomingBookingDto(b.Id, b.RequestId, user.Id, fullName, b.From, "ClockIn"));
            }

            if (b.To >= today && b.To <= windowEnd)
            {
                upcomingDtos.Add(new UpcomingBookingDto(b.Id, b.RequestId, user.Id, fullName, b.To, "ClockOut"));
            }
        }

        upcomingDtos = upcomingDtos.OrderBy(u => u.Date).ToList();
        var tomorrow = today.AddDays(1);
        var upcomingBuckets = new UpcomingCheckInsOutsDto(
            Tomorrow: upcomingDtos.Where(u => u.Date == tomorrow).ToList(),
            Next3Days: upcomingDtos.Where(u => u.Date >= today && u.Date <= today.AddDays(3)).ToList(),
            Next7Days: upcomingDtos.Where(u => u.Date >= today && u.Date <= today.AddDays(7)).ToList());

        var pendingRequests = await db.Requests
            .Include(r => r.User)
            .Where(r => r.Status == RequestStatus.Requested)
            .OrderBy(r => r.From)
            .Select(r => new PendingRequestDto(r.Id, r.UserId, r.User!.FirstName + " " + r.User.LastName, r.From, r.To, r.Status))
            .ToListAsync();

        var crewInOutsideHotels = await db.HotelPlacements
            .Include(h => h.Request)
            .ThenInclude(r => r!.User)
            .Where(h => h.From <= today && today <= h.To)
            .Select(h => new ActiveHotelPlacementDto(h.Id, h.RequestId, h.Request!.User!.Id, h.Request.User.FirstName + " " + h.Request.User.LastName, h.HotelName, h.From, h.To))
            .ToListAsync();

        return Ok(new DashboardDto(occupancy, upcomingBuckets, pendingRequests, crewInOutsideHotels));
    }

    private async Task<List<LocationOccupancyDto>> GetOccupancyAsync()
    {
        var locations = await db.Locations.Include(l => l.Rooms).ToListAsync();
        var result = new List<LocationOccupancyDto>();

        foreach (var location in locations)
        {
            int empty = 0, occupied = 0, full = 0;
            foreach (var room in location.Rooms)
            {
                var status = await availability.GetRoomStatusAsync(room.Id);
                switch (status)
                {
                    case RoomStatus.Empty: empty++; break;
                    case RoomStatus.Occupied: occupied++; break;
                    case RoomStatus.Full: full++; break;
                }
            }

            result.Add(new LocationOccupancyDto(location.Id, location.LocationName, empty, occupied, full));
        }

        return result;
    }
}
