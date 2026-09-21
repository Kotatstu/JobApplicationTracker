import { useMutation, useQueryClient } from "@tanstack/react-query"
import { jobApplicationsApi, type UpdateJobApplicationInput } from "../api/jobApplicationsApi"

export function useUpdateJobApplication(id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: UpdateJobApplicationInput) => jobApplicationsApi.update(id, input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobApplications'] }),
    })
}