using ABLMess.Api.Data;
using ABLMess.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.BookingLogic;

public class RoomAvailabilityService(AblMessDbContext db)
{
    public async Task<bool> IsBedAvailableAsync(int bedId, DateOnly from, DateOnly to, int? excludeBookingId = null)
    {
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

        var bedIds = await db.Beds.Where(b => b.RoomId == roomId).Select(b => b.Id).ToListAsync();
        if (bedIds.Count == 0)
        {
            return RoomStatus.Empty;
        }

        var occupiedBedCount = await db.Bookings
            .Where(b => bedIds.Contains(b.BedId) &&
                        b.Status != BookingStatus.Cancelled &&
                        b.From <= date && date <= b.To)
            .Select(b => b.BedId)
            .Distinct()
            .CountAsync();

        return occupiedBedCount switch
        {
            0 => RoomStatus.Empty,
            _ when occupiedBedCount >= bedIds.Count => RoomStatus.Full,
            _ => RoomStatus.Occupied
        };
    }
}
