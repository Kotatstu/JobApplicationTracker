export interface JobPostingDetails {
    id: number
    jobApplicationId: number
    rawText: string
    detailsJson: string | null
    createdAt: string
}

export interface JobPostingDetailsResult {
    hasDetails: boolean
    detail: JobPostingDetails | null
}