namespace ABLMess.Api.Models;

public class Room
{
    public int Id { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public int LocationId { get; set; }
    public Location? Location { get; set; }

    // Not stored directly — computed from Beds occupancy at read time.
    public RoomStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Bed> Beds { get; set; } = new List<Bed>();
}
