export interface JobApplication {
    id: number
    companyId: number
    companyName: string
    jobTitle: string
    jobPostingUrl: string | null
    location: string | null
    dateApplied: string
    currentStatus: string
    createVia: string
    notes: string | null
    createdAt: string
    updatedAt: string
}