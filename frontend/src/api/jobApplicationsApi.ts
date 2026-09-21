import { api } from './axiosInstance'
import type { JobApplication } from '../types/jobApplication'
import type { StatusHistoryEntry } from '../types/statusHistory'
import type { JobPostingDetails, JobPostingDetailsResult } from '../types/jobPostingDetails'

export interface CreateJobApplicationInput {
    companyId: number
    jobTitle: string
    jobPostingUrl?: string
    location?: string
    dateApplied: string
    notes?: string
}

export interface UpdateJobApplicationInput {
    companyId?: number
    jobTitle?: string
    jobPostingUrl?: string
    location?: string
    dateApplied?: string
    notes?: string
}

export const jobApplicationsApi = {
    getAll: async (): Promise<JobApplication[]> => {
        const response = await api.get<JobApplication[]>('/jobApplications/getAll')
        return response.data
    },

    getById: async (id: number): Promise<JobApplication> => {
        const response = await api.get<JobApplication>(`/jobApplications/getById/${id}`)
        return response.data
    },

    getStatusHistory: async (id: number): Promise<StatusHistoryEntry[]> => {
        const response = await api.get<StatusHistoryEntry[]>(`/jobApplications/getAllStatusHistoryById/${id}`)
        return response.data
    },
    getPostingDetails: async (id: number): Promise<JobPostingDetailsResult> => {
        const response = await api.get<JobPostingDetailsResult>(`/jobApplications/jobPostingDetailsGetById/${id}`)
        return response.data
    },

    create: async (input: CreateJobApplicationInput): Promise<JobApplication> => {
        const response = await api.post<JobApplication>('/jobApplications/create', input)
        return response.data
    },

    update: async (id: number, input: UpdateJobApplicationInput): Promise<JobApplication> => {
        const response = await api.put<JobApplication>(`/jobApplications/update/${id}`, input)
        return response.data
    },
    updateStatus: async (id: number, status: string, note?: string): Promise<JobApplication> => {
        const response = await api.post<JobApplication>(`/jobApplications/updateStatus/${id}`, { status, note })
        return response.data
    },

    upsertPostingDetails: async (id: number, rawText: string): Promise<JobPostingDetails> => {
        const response = await api.put<JobPostingDetails>(`/jobApplications/jobPostingDetailsUpsert/${id}`, { rawText })
        return response.data
    },
}