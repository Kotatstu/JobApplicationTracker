using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Interfaces;

public interface IJobApplicationService
{
    Task<List<JobApplicationResponseDTO>> GetAllAsync(Guid userId);
    Task<JobApplicationResponseDTO?> GetByIdAsync(int id, Guid userId);
    Task<(JobApplicationResponseDTO?, JobApplicationCreateResult)> CreateAsync(JobApplicationCreateDTO dto, Guid userId);
    Task<(JobApplicationResponseDTO?, JobApplicationUpdateResponse)> UpdateByIdAsync(JobApplicationUpdateDTO dto, int id, Guid userId);
    Task<(JobApplicationResponseDTO?, UpdateStatusResult)> UpdateStatusAsync(ChangeStatusDTO dto, int id, Guid userId);
}