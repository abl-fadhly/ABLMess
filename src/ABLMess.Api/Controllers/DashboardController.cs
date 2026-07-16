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
        var bedOccupancy = await GetBedOccupancyAsync();

        var upcoming = await db.Bookings
            .Include(b => b.Request)
            .ThenInclude(r => r!.User)
            .Include(b => b.Bed)
            .ThenInclude(bed => bed!.Room)
            .ThenInclude(room => room!.Location)
            .Where(b => b.Status == BookingStatus.Booked || b.Status == BookingStatus.CheckedIn)
            .Where(b => (b.From >= today && b.From <= windowEnd) || (b.To >= today && b.To <= windowEnd))
            .ToListAsync();

        var upcomingDtos = new List<UpcomingBookingDto>();
        foreach (var b in upcoming)
        {
            var user = b.Request!.User!;
            var fullName = $"{user.FirstName} {user.LastName}";
            var roomName = b.Bed!.Room!.RoomName;
            var bedName = b.Bed.BedName;
            var locationName = b.Bed.Room.Location!.LocationName;

            if (b.Status == BookingStatus.Booked && b.From >= today && b.From <= windowEnd)
            {
                upcomingDtos.Add(new UpcomingBookingDto(b.Id, b.RequestId, user.Id, fullName, b.From, "CheckIn", roomName, bedName, locationName));
            }

            if (b.To >= today && b.To <= windowEnd)
            {
                upcomingDtos.Add(new UpcomingBookingDto(b.Id, b.RequestId, user.Id, fullName, b.To, "CheckOut", roomName, bedName, locationName));
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
            .Select(r => new PendingRequestDto(
                r.Id, r.UserId, r.User!.FirstName + " " + r.User.LastName, r.User.EmployeeCode, r.User.PhotoUrl, r.From, r.To, r.Status))
            .ToListAsync();

        var crewInOutsideHotels = await db.HotelPlacements
            .Include(h => h.Request)
            .ThenInclude(r => r!.User)
            .Where(h => h.From <= today && today <= h.To)
            .Select(h => new ActiveHotelPlacementDto(
                h.Id, h.RequestId, h.Request!.User!.Id, h.Request.User.FirstName + " " + h.Request.User.LastName,
                h.Request.User.EmployeeCode, h.Request.User.PhotoUrl, h.HotelName, h.Notes, h.From, h.To))
            .ToListAsync();

        var checkInToday = await db.Bookings
            .Where(b => (b.Status == BookingStatus.Booked || b.Status == BookingStatus.CheckedIn) && b.From == today)
            .CountAsync();
        var checkOutToday = await db.Bookings
            .Where(b => (b.Status == BookingStatus.Booked || b.Status == BookingStatus.CheckedIn) && b.To == today)
            .CountAsync();

        var totalBeds = bedOccupancy.Sum(b => b.TotalBeds);
        var availableBeds = bedOccupancy.Sum(b => b.AvailableBeds);
        var occupiedBeds = bedOccupancy.Sum(b => b.OccupiedBeds);
        var occupancyRatePercent = totalBeds == 0 ? 0 : Math.Round(100.0 * occupiedBeds / totalBeds, 1);

        var stats = new DashboardStatsDto(
            PendingRequestsCount: pendingRequests.Count,
            AvailableBedsCount: availableBeds,
            TotalBedsCount: totalBeds,
            OccupancyRatePercent: occupancyRatePercent,
            CheckInTodayCount: checkInToday,
            CheckOutTodayCount: checkOutToday,
            HotelPlacementCount: crewInOutsideHotels.Count);

        return Ok(new DashboardDto(stats, occupancy, bedOccupancy, upcomingBuckets, pendingRequests, crewInOutsideHotels));
    }

    [HttpGet("activities")]
    public async Task<ActionResult<List<ActivityDto>>> GetActivities([FromQuery] int limit = 20)
    {
        var activities = await db.AuditLogs
            .Include(a => a.ActorUser)
            .Include(a => a.SubjectUser)
            .OrderByDescending(a => a.CreatedAt)
            .Take(Math.Clamp(limit, 1, 100))
            .Select(a => new ActivityDto(
                a.Id,
                a.ActionType,
                a.Description,
                a.ActorUser == null ? null : a.ActorUser.FirstName + " " + a.ActorUser.LastName,
                a.SubjectUser == null ? null : a.SubjectUser.FirstName + " " + a.SubjectUser.LastName,
                a.CreatedAt))
            .ToListAsync();

        return Ok(activities);
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

    private async Task<List<LocationBedOccupancyDto>> GetBedOccupancyAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var locations = await db.Locations.Include(l => l.Rooms).ThenInclude(r => r.Beds).ToListAsync();
        var result = new List<LocationBedOccupancyDto>();

        foreach (var location in locations)
        {
            var beds = location.Rooms.SelectMany(r => r.Beds).ToList();
            int maintenance = 0, available = 0;
            foreach (var bed in beds)
            {
                if (bed.Status == BedStatus.Maintenance)
                {
                    maintenance++;
                }
                else if (await availability.IsBedAvailableAsync(bed.Id, today, today))
                {
                    available++;
                }
            }

            var occupied = beds.Count - available - maintenance;
            result.Add(new LocationBedOccupancyDto(location.Id, location.LocationName, location.ImageUrl, beds.Count, occupied, available, maintenance));
        }

        return result;
    }
}
