using System.Globalization;
using backend.DTOs;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/jobApplications")]
public class JobApplicationsController : ControllerBase
{
    private readonly IJobApplicationService _jobApplicationService;
    public JobApplicationsController(IJobApplicationService jobApplicationService)
    {
        _jobApplicationService = jobApplicationService;
    }

    [HttpGet]
    [Route("{userId}")]
    public async Task<IActionResult> GetAll([FromRoute] Guid userId)
    {
        var ja = await _jobApplicationService.GetAllAsync(userId);

        return Ok(ja);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JobApplicationCreateDTO dto)
    {
        var (ja, result) = await _jobApplicationService.CreateAsync(dto);

        return result switch
        {
            JobApplicationCreateResult.CompanyNotFound => NotFound(ja),
            JobApplicationCreateResult.Success => Ok(ja),
            _ => throw new InvalidOperationException()
        };

    }
}