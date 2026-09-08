using System.Globalization;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/jobApplications")]
public class JobApplicationsController : ApiControllerBase
{
    private readonly IJobApplicationService _jobApplicationService;
    public JobApplicationsController(IJobApplicationService jobApplicationService)
    {
        _jobApplicationService = jobApplicationService;
    }

    [HttpGet]
    [Route("getAll")]
    public async Task<IActionResult> GetAll()
    {
        var ja = await _jobApplicationService.GetAllAsync(CurrentUserId);

        return Ok(ja);
    }

    [HttpGet]
    [Route("getById/{id}")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var ja = await _jobApplicationService.GetByIdAsync(id, CurrentUserId);

        if(ja is null)
            return NotFound();

        return Ok(ja);
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> Create([FromBody] JobApplicationCreateDTO dto)
    {
        var (ja, result) = await _jobApplicationService.CreateAsync(dto, CurrentUserId);

        return result switch
        {
            JobApplicationCreateResult.CompanyNotFound => NotFound(ja),
            JobApplicationCreateResult.Success when ja is not null => CreatedAtAction(nameof(GetById), new {id = ja.Id, CurrentUserId}, ja),
            _ => throw new InvalidOperationException()
        };

    }

    [HttpPut]
    [Route("update/{id}")]
    public async Task<IActionResult> Update([FromBody] JobApplicationUpdateDTO dto, [FromRoute] int id)
    {
        var (ja, result) = await _jobApplicationService.UpdateByIdAsync(dto, id, CurrentUserId);

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
    [Route("updateStatus/{id}")]
    public async Task<IActionResult> UpdateStatus([FromBody] ChangeStatusDTO dto, [FromRoute]int id)
    {
        var (ja, result) = await _jobApplicationService.UpdateStatusAsync(dto, id, CurrentUserId);

        return result switch
        {
            UpdateStatusResult.Success => Ok(ja),
            UpdateStatusResult.NotFound => NotFound(),
            UpdateStatusResult.InvalidStatus => BadRequest("Status cannot be empty"),
            _ => throw new InvalidOperationException()
        };
    }

    [HttpGet]
    [Route("getAllStatusHistoryById/{id}")]
    public async Task<IActionResult> GetAllStatusById([FromRoute] int id)
    {
        var (h, result) = await _jobApplicationService.GetStatusHistoryById(id, CurrentUserId);

        return result switch
        {
            GetStatusHistoryResult.Success => Ok(h),
            GetStatusHistoryResult.NotFound => NotFound(),
            _ => throw new InvalidOperationException()
        };
    }

    [HttpPut]
    [Route("jobPostingDetailsUpsert/{JobApplicationId}")]
    public async Task<IActionResult> JobPostingDetailsUpsert([FromBody] JobPostingDetailUpsertDTO dto, [FromRoute] int JobApplicationId)
    {
        var (d, result) = await _jobApplicationService.UpsertAsync(dto, JobApplicationId, CurrentUserId);

        return result switch
        {
            JobPostingDetailUpsertResult.Created => CreatedAtAction(nameof(GetPostingDetailById), new { jobApplicationId = JobApplicationId, CurrentUserId }, d),
            JobPostingDetailUpsertResult.Updated => Ok(d),
            JobPostingDetailUpsertResult.NotFound => NotFound(),
            _ => throw new InvalidOperationException()
        };
    }

    [HttpGet]
    [Route("jobPostingDetailsGetById/{jobApplicationId}")]
    public async Task<IActionResult> GetPostingDetailById([FromRoute] int jobApplicationId)
    {
        var (detail, result) = await _jobApplicationService.GetPostingDetailById(jobApplicationId, CurrentUserId);

        return result switch
        {
            GetJobPostingDetailResult.Success => Ok(detail),
            GetJobPostingDetailResult.ApplicationNotFound => NotFound(),
            GetJobPostingDetailResult.NoDetailsYet => Ok(new { message = "No posting details saved yet.", detail = (JobPostingDetailReponseDTO?)null }),
            _ => throw new InvalidOperationException()
        };
    }
}