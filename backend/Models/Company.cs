namespace backend.Models;

public class Company
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? WebstieUrl { get; set; }
    public string? Industry { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;

}