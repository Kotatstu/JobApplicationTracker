import { useQuery } from "@tanstack/react-query";
import { jobApplicationsApi } from "../api/jobApplicationsApi";

export function useStatusHistory(id: number) {
    return useQuery({
        queryKey: ['jobApplications', id, 'statusHistory'],
        queryFn: () => jobApplicationsApi.getStatusHistory(id),
    })
}