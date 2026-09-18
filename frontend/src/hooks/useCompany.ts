import { useQuery } from '@tanstack/react-query'
import { companiesApi } from '../api/companiesApi'

export function useCompany(id: number) {
    return useQuery({
        queryKey: ['companies', id],
        queryFn: () => companiesApi.getById(id),
    })
}