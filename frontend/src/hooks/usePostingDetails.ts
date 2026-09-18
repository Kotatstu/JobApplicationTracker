import { useQuery } from "@tanstack/react-query";
import { jobApplicationsApi } from "../api/jobApplicationsApi";

export function usePostingDetails(id: number) {
    return useQuery({
        queryKey: ['jobApplications', id, 'postingDetails'],
        queryFn: () => jobApplicationsApi.getPostingDetails(id),
    })
}