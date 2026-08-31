using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class ChangeStatusDTO
{
    [Required]
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
}