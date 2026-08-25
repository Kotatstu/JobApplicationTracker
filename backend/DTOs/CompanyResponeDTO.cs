namespace backend.DTOs;

public class CompanyResponeDTO
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? WebstieUrl { get; set; }
    public string? Industry { get; set; }
}