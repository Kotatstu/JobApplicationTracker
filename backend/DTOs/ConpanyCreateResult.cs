using Microsoft.Net.Http.Headers;

namespace backend.DTOs;

public class CompanyCreateResult
{
    public CompanyResponseDTO Company { get; set; } = null!;
    public bool WasExisting { get; set; }
}
