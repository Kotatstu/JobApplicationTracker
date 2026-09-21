import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CompanyPicker } from '../components/CompanyPicker'
import { useJobApplication } from '../hooks/useJobApplication'
import { useUpdateJobApplication } from '../hooks/useUpdateJobApplication'

export function EditApplicationPage() {
    const { id } = useParams<{ id: string }>()
    const applicationId = Number(id)
    const { data } = useJobApplication(applicationId)
    const updateMutation = useUpdateJobApplication(applicationId)
    const navigate = useNavigate()

    const [companyId, setCompanyId] = useState<number | null>(null)
    const [jobTitle, setJobTitle] = useState('')
    const [jobPostingUrl, setJobPostingUrl] = useState('')
    const [location, setLocation] = useState('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        if (data) {
            // oxlint-disable-next-line react/set-state-in-effect
            setCompanyId(data.companyId)
            setJobTitle(data.jobTitle)
            setJobPostingUrl(data.jobPostingUrl ?? '')
            setLocation(data.location ?? '')
            setNotes(data.notes ?? '')
        }
    }, [data])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateMutation.mutateAsync({
            companyId: companyId ?? undefined,
            jobTitle,
            jobPostingUrl,
            location,
            notes,
        })
        navigate(`/applications/${applicationId}`)
    }

    if (!data) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Edit Application</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="text-sm font-medium">Company</label>
                <CompanyPicker value={companyId} onChange={(id) => setCompanyId(id)} />

                <label className="text-sm font-medium">Job Title</label>
                <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required className="border rounded px-3 py-2" />

                <label className="text-sm font-medium">Job Posting URL</label>
                <input value={jobPostingUrl} onChange={(e) => setJobPostingUrl(e.target.value)} className="border rounded px-3 py-2" />

                <label className="text-sm font-medium">Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="border rounded px-3 py-2" />

                <label className="text-sm font-medium">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="border rounded px-3 py-2" />

                <button type="submit" disabled={updateMutation.isPending} className="bg-blue-600 text-white py-2 rounded mt-2">
                    Save Changes
                </button>
            </form>
        </div>
    )
}