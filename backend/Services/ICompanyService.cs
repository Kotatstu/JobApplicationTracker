using backend.DTOs;

namespace backend.Services;

//Company service interface
public interface ICompanyService
{
    //Task make this async
    Task<List<CompanyResponseDTO>> GetAllAsync();
    Task<(CompanyResponseDTO Company, bool WasCreated)> CreateAsync(CompanyCreateDTO dto);
    Task<CompanyResponseDTO?> GetByIdAsync(int id);
    Task<(CompanyResponseDTO?, UpdateCompanyResult)> UpdateByIdAsync(int id, Guid userId, CompanyUpdateDTO dto);
    // //Pactice delete pattern only
    // Task<bool> DeleteByIdAsync(int id, Guid userId);
}

