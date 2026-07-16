using ABLMess.Api.Data;
using ABLMess.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.BookingLogic;

public class RoomAvailabilityService(AblMessDbContext db)
{
    public async Task<bool> IsBedAvailableAsync(int bedId, DateOnly from, DateOnly to, int? excludeBookingId = null)
    {
        var bedStatus = await db.Beds.Where(b => b.Id == bedId).Select(b => b.Status).FirstOrDefaultAsync();
        if (bedStatus == BedStatus.Maintenance)
        {
            return false;
        }

        var query = db.Bookings.Where(b =>
            b.BedId == bedId &&
            b.Status != BookingStatus.Cancelled &&
            b.From <= to && from <= b.To);

        if (excludeBookingId is not null)
        {
            query = query.Where(b => b.Id != excludeBookingId);
        }

        return !await query.AnyAsync();
    }

    public async Task<RoomStatus> GetRoomStatusAsync(int roomId, DateOnly? asOf = null)
    {
        var date = asOf ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var beds = await db.Beds.Where(b => b.RoomId == roomId).Select(b => new { b.Id, b.Status }).ToListAsync();
        if (beds.Count == 0)
        {
            return RoomStatus.Empty;
        }

        var bedIds = beds.Select(b => b.Id).ToList();
        var bookedBedIds = await db.Bookings
            .Where(b => bedIds.Contains(b.BedId) &&
                        b.Status != BookingStatus.Cancelled &&
                        b.From <= date && date <= b.To)
            .Select(b => b.BedId)
            .Distinct()
            .ToListAsync();

        var maintenanceBedIds = beds.Where(b => b.Status == BedStatus.Maintenance).Select(b => b.Id);
        var occupiedBedCount = bookedBedIds.Union(maintenanceBedIds).Count();

        return occupiedBedCount switch
        {
            0 => RoomStatus.Empty,
            _ when occupiedBedCount >= bedIds.Count => RoomStatus.Full,
            _ => RoomStatus.Occupied
        };
    }
}
