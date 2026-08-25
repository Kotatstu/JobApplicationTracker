using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;   

public class CompanyCreateDTO
{
    public Guid UserId { get; set; }
    [Required]
    public string CompanyName { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public string? Industry { get; set; }

}