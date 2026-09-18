import { useQuery } from '@tanstack/react-query'
import { jobApplicationsApi } from '../api/jobApplicationsApi'

export function useJobApplications() {
    return useQuery({
        queryKey: ['jobApplications'],
        queryFn: jobApplicationsApi.getAll,
    })
}