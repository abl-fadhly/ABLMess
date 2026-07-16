namespace ABLMess.Api.Models;

public class Bed
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public Room? Room { get; set; }
    public string BedName { get; set; } = string.Empty;
    // Administrative toggle only: Available or Maintenance. "Occupied" is never persisted here —
    // it's a computed presentation state derived from active bookings (see RoomAvailabilityService).
    public BedStatus Status { get; set; } = BedStatus.Available;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
