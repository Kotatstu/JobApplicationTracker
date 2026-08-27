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
    public async Task<IActionResult> GetAll()
    {
        var ja = await _jobApplicationService.GetAllAsync();

        return Ok(ja);
    }
}