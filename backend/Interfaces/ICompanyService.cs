using backend.DTOs;
using backend.Services;

namespace backend.Interfaces;

//Company service interface
public interface ICompanyService
{
    Task<List<CompanyResponseDTO>> GetAllAsync();
    Task<(CompanyResponseDTO Company, bool WasCreated)> CreateAsync(CompanyCreateDTO dto);
    Task<CompanyResponseDTO?> GetByIdAsync(int id);
    Task<(CompanyResponseDTO?, UpdateCompanyResult)> UpdateByIdAsync(int id, Guid userId, CompanyUpdateDTO dto);
    // //Pactice delete pattern only
    // Task<bool> DeleteByIdAsync(int id, Guid userId);
}

