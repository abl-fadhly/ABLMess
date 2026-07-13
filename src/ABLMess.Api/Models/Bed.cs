namespace ABLMess.Api.Models;

public class Bed
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public Room? Room { get; set; }
    public string BedName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
