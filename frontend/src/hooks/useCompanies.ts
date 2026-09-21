import { useQuery } from "@tanstack/react-query";
import { companiesApi } from "../api/companiesApi";

export function useCompanies() {
    return useQuery({
        queryKey: ['companies'],
        queryFn: companiesApi.getAll,
    })
}