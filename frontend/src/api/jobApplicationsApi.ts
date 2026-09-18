import { api } from './axiosInstance'
import type { JobApplication } from '../types/jobApplication'
import type { StatusHistoryEntry } from '../types/statusHistory'
import type { JobPostingDetailsResult } from '../types/jobPostingDetails'

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
}