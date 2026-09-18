import { useQuery } from '@tanstack/react-query'
import { jobApplicationsApi } from '../api/jobApplicationsApi'

export function useJobApplication(id: number) {
    return useQuery({
        queryKey: ['jobApplications', id],
        queryFn: () => jobApplicationsApi.getById(id),
    })
}