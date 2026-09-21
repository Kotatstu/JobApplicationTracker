import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CompanyPicker } from '../components/CompanyPicker'
import { useCreateJobApplication } from '../hooks/useCreateJobApplication'

export function CreateApplicationPage() {
    const [companyId, setCompanyId] = useState<number | null>(null)
    const [jobTitle, setJobTitle] = useState('')
    const [jobPostingUrl, setJobPostingUrl] = useState('')
    const [location, setLocation] = useState('')
    const [dateApplied, setDateApplied] = useState(new Date().toISOString().slice(0, 10))
    const [notes, setNotes] = useState('')
    const [error, setError] = useState<string | null>(null)

    const createMutation = useCreateJobApplication()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!companyId) {
            setError('Please select or add a company.')
            return
        }

        try {
            const created = await createMutation.mutateAsync({
                companyId,
                jobTitle,
                jobPostingUrl: jobPostingUrl || undefined,
                location: location || undefined,
                dateApplied,
                notes: notes || undefined,
            })
            navigate(`/applications/${created.id}`)
        } catch {
            setError('Could not create application — check the company is valid.')
        }
    }

    return (
        <div className="p-8 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">New Application</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {error && <p className="text-red-600 text-sm">{error}</p>}

                <label className="text-sm font-medium">Company</label>
                <CompanyPicker value={companyId} onChange={(id) => setCompanyId(id)} />

                <label className="text-sm font-medium">Job Title</label>
                <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required className="border rounded px-3 py-2" />

                <label className="text-sm font-medium">Date Applied</label>
                <input type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} required className="border rounded px-3 py-2" />

                <label className="text-sm font-medium">Job Posting URL</label>
                <input value={jobPostingUrl} onChange={(e) => setJobPostingUrl(e.target.value)} className="border rounded px-3 py-2" />

                <label className="text-sm font-medium">Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="border rounded px-3 py-2" />

                <label className="text-sm font-medium">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="border rounded px-3 py-2" />

                <button type="submit" disabled={createMutation.isPending} className="bg-blue-600 text-white py-2 rounded mt-2">
                    {createMutation.isPending ? 'Creating...' : 'Create Application'}
                </button>
            </form>
        </div>
    )
}