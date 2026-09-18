import { api } from './axiosInstance'
import type { Company } from '../types/company'

export const companiesApi = {
    getById: async (id: number): Promise<Company> => {
        const response = await api.get<Company>(`/companies/getById/${id}`)
        return response.data
    },
}