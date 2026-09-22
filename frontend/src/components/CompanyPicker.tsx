import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { companiesApi } from '../api/companiesApi'

interface CompanyPickerProps {
  value: number | null
  onChange: (companyId: number, companyName: string) => void
}

export function CompanyPicker({ value, onChange }: CompanyPickerProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { data: companies } = useQuery({ queryKey: ['companies'], queryFn: companiesApi.getAll })
  const queryClient = useQueryClient()

  const createCompany = useMutation({
    mutationFn: companiesApi.create,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      onChange(result.company.id, result.company.companyName)
      setSearch(result.company.companyName)
      setIsOpen(false)
    },
  })

  useEffect(() => {
    if (value && companies) {
      const match = companies.find((c) => c.id === value)
      // oxlint-disable-next-line react/set-state-in-effect
      if (match) setSearch(match.companyName)
    }
  }, [value, companies])

  const matches = companies?.filter((c) => c.companyName.toLowerCase().includes(search.toLowerCase())) ?? []
  const exactMatch = matches.some((c) => c.companyName.toLowerCase() === search.toLowerCase())

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search or add a company..."
          className="pl-9"
        />
      </div>

      {isOpen && search && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden">
          <ul className="max-h-48 overflow-y-auto py-1">
            {matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => { onChange(c.id, c.companyName); setSearch(c.companyName); setIsOpen(false) }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent text-left"
                >
                  {c.companyName}
                  {value === c.id && <Check className="h-4 w-4 text-primary" />}
                </button>
              </li>
            ))}

            {!exactMatch && (
              <li>
                <button
                  type="button"
                  onClick={() => createCompany.mutate(search)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-accent text-left"
                >
                  <Plus className="h-4 w-4" />
                  Add "{search}" as a new company
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}