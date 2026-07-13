namespace ABLMess.Api.Models;

public class Location
{
    public int Id { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public string LocationAddress { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Room> Rooms { get; set; } = new List<Room>();
}
