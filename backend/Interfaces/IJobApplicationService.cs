using backend.DTOs;

namespace backend.Interfaces;

public interface IJobApplicationService
{
    Task<List<JobApplicationResponseDTO>> GetAllAsync();
}