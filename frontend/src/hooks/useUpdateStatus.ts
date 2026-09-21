import { useQueryClient, useMutation } from "@tanstack/react-query";
import { jobApplicationsApi } from "../api/jobApplicationsApi";

export function useUpdateStatus(id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ status, note }: { status: string; note?: string }) =>
            jobApplicationsApi.updateStatus(id, status, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobApplications', id] })
            queryClient.invalidateQueries({ queryKey: ['jobApplications', id, 'statusHistory'] })
            queryClient.invalidateQueries({ queryKey: ['jobApplications'] }) // list shows currentStatus too
        },
    })
}