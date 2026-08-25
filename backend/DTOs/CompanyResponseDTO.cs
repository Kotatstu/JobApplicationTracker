namespace backend.DTOs;

public class CompanyResponseDTO
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public string? Industry { get; set; }
}