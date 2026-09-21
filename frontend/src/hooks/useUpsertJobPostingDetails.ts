import { useQueryClient, useMutation } from "@tanstack/react-query"
import { jobApplicationsApi } from "../api/jobApplicationsApi"

export function useUpsertPostingDetails(id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (rawText: string) => jobApplicationsApi.upsertPostingDetails(id, rawText),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobApplications', id, 'postingDetails'] }),
    })
}