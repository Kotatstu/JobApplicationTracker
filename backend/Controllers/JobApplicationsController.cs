using System.Globalization;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
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
    [Route("getAll/{userId}")]
    public async Task<IActionResult> GetAll([FromRoute] Guid userId)
    {
        var ja = await _jobApplicationService.GetAllAsync(userId);

        return Ok(ja);
    }

    [HttpGet]
    [Route("getById/{id}/{userId}")]
    public async Task<IActionResult> GetById([FromRoute] int id, [FromRoute] Guid userId)
    {
        var ja = await _jobApplicationService.GetByIdAsync(id, userId);

        if(ja is null)
            return NotFound();

        return Ok(ja);
    }

    [HttpPost]
    [Route("create/{userId}")]
    public async Task<IActionResult> Create([FromBody] JobApplicationCreateDTO dto, [FromRoute] Guid userId)
    {
        var (ja, result) = await _jobApplicationService.CreateAsync(dto, userId);

        return result switch
        {
            JobApplicationCreateResult.CompanyNotFound => NotFound(ja),
            JobApplicationCreateResult.Success when ja is not null => CreatedAtAction(nameof(GetById), new {id = ja.Id, userId}, ja),
            _ => throw new InvalidOperationException()
        };

    }

    [HttpPut]
    [Route("update/{id}/{userId}")]
    public async Task<IActionResult> Update([FromBody] JobApplicationUpdateDTO dto, [FromRoute] int id, [FromRoute] Guid userId)
    {
        var (ja, result) = await _jobApplicationService.UpdateByIdAsync(dto, id, userId);

        return result switch
        {
            JobApplicationUpdateResponse.NotFound => NotFound(),
            JobApplicationUpdateResponse.CompanyNotFound => NotFound(),
            JobApplicationUpdateResponse.InvalidJobTitle => BadRequest("Job title cannot be empty"),
            JobApplicationUpdateResponse.Success => Ok(ja),
            _ => throw new InvalidOperationException()
        };
    }

    [HttpPost]
    [Route("updateStatus/{id}/{userId}")]
    public async Task<IActionResult> UpdateStatus([FromBody] ChangeStatusDTO dto, [FromRoute]int id, [FromRoute] Guid userId)
    {
        var (ja, result) = await _jobApplicationService.UpdateStatusAsync(dto, id, userId);

        return result switch
        {
            UpdateStatusResult.Success => Ok(ja),
            UpdateStatusResult.NotFound => NotFound(),
            UpdateStatusResult.InvalidStatus => BadRequest("Status cannot be empty"),
            _ => throw new InvalidOperationException()
        };
    }

    [HttpGet]
    [Route("getAllStatusHistoryById/{id}/{userId}")]
    public async Task<IActionResult> GetAllStatusById([FromRoute] int id, [FromRoute] Guid userId)
    {
        var (h, result) = await _jobApplicationService.GetStatusHistoryById(id, userId);

        return result switch
        {
            GetStatusHistoryResult.Success => Ok(h),
            GetStatusHistoryResult.NotFound => NotFound(),
            _ => throw new InvalidOperationException()
        };
    }

    [HttpPut]
    [Route("jobPostingDetailsUpsert/{JobApplicationId}/{userId}")]
    public async Task<IActionResult> JobPostingDetailsUpsert([FromBody] JobPostingDetailUpsertDTO dto, [FromRoute] int JobApplicationId, [FromRoute] Guid userId)
    {
        var (d, result) = await _jobApplicationService.UpsertAsync(dto, JobApplicationId, userId);

        return result switch
        {
            JobPostingDetailUpsertResult.Created => CreatedAtAction(nameof(GetPostingDetailById), new { jobApplicationId = JobApplicationId, userId }, d),
            JobPostingDetailUpsertResult.Updated => Ok(d),
            JobPostingDetailUpsertResult.NotFound => NotFound(),
            _ => throw new InvalidOperationException()
        };
    }

    [HttpGet]
    [Route("jobPostingDetailsGetById/{jobApplicationId}/{userId}")]
    public async Task<IActionResult> GetPostingDetailById([FromRoute] int jobApplicationId, [FromRoute] Guid userId)
    {
        var (detail, result) = await _jobApplicationService.GetPostingDetailById(jobApplicationId, userId);

        return result switch
        {
            GetJobPostingDetailResult.Success => Ok(detail),
            GetJobPostingDetailResult.ApplicationNotFound => NotFound(),
            GetJobPostingDetailResult.NoDetailsYet => Ok(new { message = "No posting details saved yet.", detail = (JobPostingDetailReponseDTO?)null }),
            _ => throw new InvalidOperationException()
        };
    }
}