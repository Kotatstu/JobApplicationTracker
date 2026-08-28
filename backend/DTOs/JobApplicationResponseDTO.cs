using Humanizer;

namespace backend.DTOs;

public class JobApplicationResponseDTO
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string? JobPostingUrl { get; set; }
    public string? Location { get; set; }
    public DateTime DateApplied { get; set; }
    public string CurrentStatus { get; set; } = "Applied";
    public string CreateVia { get; set; } = "Manual";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}