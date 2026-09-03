namespace backend.DTOs;

public enum JobPostingDetailUpsertResult
{
    Created, //sucessfully create a new PostingDetails
    Updated, //successully update the existing PostingDetails
    NotFound //Cant find the correct job application

}