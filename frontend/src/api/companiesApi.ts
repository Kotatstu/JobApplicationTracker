import { api } from './axiosInstance'
import type { Company } from '../types/company'

export interface CompanyCreateResult {
    company: Company
    wasExisting: boolean
}

export const companiesApi = {
    getAll: async (): Promise<Company[]> => {
        const response = await api.get<Company[]>('/companies/getAll')
        return response.data
    },

    getById: async (id: number): Promise<Company> => {
        const response = await api.get<Company>(`/companies/getById/${id}`)
        return response.data
    },

    create: async (companyName: string): Promise<CompanyCreateResult> => {
        const response = await api.post<CompanyCreateResult>('/companies/create', { companyName })
        return response.data
    },

    update: async (id: number, input: { companyName?: string; websiteUrl?: string; industry?: string }): Promise<Company> => {
        const response = await api.put<Company>(`/companies/update/${id}`, input)
        return response.data
    },
}