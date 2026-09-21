import { useEffect, useState } from 'react'
import { useCompanies } from '../hooks/useCompanies'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { companiesApi } from '../api/companiesApi'

interface CompanyPickerProps {
    value: number | null
    onChange: (companyId: number, companyName: string) => void
}

export function CompanyPicker({ value, onChange }: CompanyPickerProps) {
    const [search, setSearch] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const { data: companies } = useCompanies()
    const queryClient = useQueryClient()

    useEffect(() => {
        if (value && companies) {
            const match = companies.find((c) => c.id === value)
            // oxlint-disable-next-line react/set-state-in-effect
            if (match) setSearch(match.companyName)
        }
    }, [value, companies])

    const createCompany = useMutation({
        mutationFn: companiesApi.create,
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['companies'] })
            onChange(result.company.id, result.company.companyName)
            setSearch(result.company.companyName)
            setIsOpen(false)
        },
    })

    const matches = companies?.filter((c) =>
        c.companyName.toLowerCase().includes(search.toLowerCase())
    ) ?? []

    const exactMatch = matches.some(
        (c) => c.companyName.toLowerCase() === search.toLowerCase()
    )

    return (
        <div className="relative">
            <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setIsOpen(true) }}
                onFocus={() => setIsOpen(true)}
                placeholder="Search or add a company..."
                className="border rounded px-3 py-2 w-full"
            />
            {isOpen && search && (
                <ul className="absolute z-10 bg-white border rounded w-full mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {matches.map((c) => (
                        <li
                            key={c.id}
                            onClick={() => { onChange(c.id, c.companyName); setSearch(c.companyName); setIsOpen(false) }}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {c.companyName}
                        </li>
                    ))}
                    {!exactMatch && (
                        <li
                            onClick={() => createCompany.mutate(search)}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-blue-600"
                        >
                            + Add "{search}" as a new company
                        </li>
                    )}
                </ul>
            )}
        </div>
    )
}