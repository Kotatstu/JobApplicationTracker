using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Interfaces;

public interface IJobApplicationService
{
    Task<List<JobApplicationResponseDTO>> GetAllAsync(Guid userI);
    Task<(JobApplicationResponseDTO?, JobApplicationCreateResult)> CreateAsync(JobApplicationCreateDTO dto);
}