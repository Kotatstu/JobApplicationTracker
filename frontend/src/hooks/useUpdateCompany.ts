import { useQueryClient, useMutation } from "@tanstack/react-query";
import { companiesApi } from "../api/companiesApi";

export function useUpdateCompany(id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: { companyName?: string; websiteUrl?: string; industry?: string }) =>
            companiesApi.update(id, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies', id] })
            queryClient.invalidateQueries({ queryKey: ['jobApplications'] }) // companyName shows in the list too
        },
    })
}