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
}