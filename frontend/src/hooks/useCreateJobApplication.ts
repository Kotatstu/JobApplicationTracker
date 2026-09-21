import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobApplicationsApi } from '../api/jobApplicationsApi'

export function useCreateJobApplication() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: jobApplicationsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobApplications'] })
        },
    })
}