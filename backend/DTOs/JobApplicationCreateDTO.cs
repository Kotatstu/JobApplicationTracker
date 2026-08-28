namespace backend.DTOs;

public class JobApplicationCreateDTO
{
    public Guid UserId { get; set; }
    public int CompanyId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string? JobPostingUrl { get; set; }
    public string? Location { get; set; }
    public DateTime DateApplied { get; set; }
    public string? Notes { get; set; }
}