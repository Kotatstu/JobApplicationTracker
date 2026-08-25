using backend.DTOs;

namespace backend.Services;

//Company service interface
public interface ICompanyService
{
    //Task make this async
    Task<List<CompanyResponeDTO>> GetAllAsync();
    Task<(CompanyResponeDTO Company, bool WasCreated)> CreateAsync(CompanyCreateDTO dto);
    Task<CompanyResponeDTO?> GetByIdAsync(int id);
}