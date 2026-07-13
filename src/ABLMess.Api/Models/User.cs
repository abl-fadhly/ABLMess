namespace ABLMess.Api.Models;

public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    // Only meaningful for Crew; Admin/GS accounts aren't tied to a ship posting.
    public int? ShipId { get; set; }
    public Ship? Ship { get; set; }
    public int? JabatanId { get; set; }
    public Jabatan? Jabatan { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserType UserType { get; set; }
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
