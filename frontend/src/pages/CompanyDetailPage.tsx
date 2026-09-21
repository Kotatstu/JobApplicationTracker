import { useParams, Link } from 'react-router-dom'
import { useCompany } from '../hooks/useCompany'
import { useState } from 'react'
import { useUpdateCompany } from '../hooks/useUpdateCompany'

export function CompanyDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { data, isLoading, isError } = useCompany(Number(id))
    const [isEditing, setIsEditing] = useState(false)
    const [draftName, setDraftName] = useState('')
    const [draftWebsite, setDraftWebsite] = useState('')
    const [draftIndustry, setDraftIndustry] = useState('')
    const [conflictError, setConflictError] = useState<string | null>(null)
    const updateMutation = useUpdateCompany(Number(id))

    if (isLoading) return <div className="p-8">Loading...</div>
    if (isError || !data) return <div className="p-8 text-red-600">Company not found.</div>

    const startEditing = () => {
        setDraftName(data!.companyName)
        setDraftWebsite(data!.websiteUrl ?? '')
        setDraftIndustry(data!.industry ?? '')
        setConflictError(null)
        setIsEditing(true)
    }

    const saveCompany = async () => {
        try {
            await updateMutation.mutateAsync({ companyName: draftName, websiteUrl: draftWebsite, industry: draftIndustry })
            setIsEditing(false)
        } catch (err: any) {
            if (err.response?.status === 409) {
                setConflictError('A company with this name already exists.')
            } else {
                setConflictError('Could not save changes.')
            }
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link to="/" className="text-blue-600 text-sm">&larr; Back to applications</Link>

            <h1 className="text-2xl font-bold mt-2">{data.companyName}</h1>

            <div className="mt-4 flex flex-col gap-2 text-sm">
                {isEditing ? (
                    <>
                        {conflictError && <p className="text-red-600">{conflictError}</p>}

                        <label className="font-semibold">Company Name</label>
                        <input
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            className="border rounded px-3 py-2"
                        />

                        <label className="font-semibold">Industry</label>
                        <input
                            value={draftIndustry}
                            onChange={(e) => setDraftIndustry(e.target.value)}
                            className="border rounded px-3 py-2"
                        />

                        <label className="font-semibold">Website</label>
                        <input
                            value={draftWebsite}
                            onChange={(e) => setDraftWebsite(e.target.value)}
                            className="border rounded px-3 py-2"
                        />

                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={saveCompany}
                                disabled={updateMutation.isPending}
                                className="bg-blue-600 text-white px-3 py-1 rounded"
                            >
                                {updateMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => setIsEditing(false)} className="text-gray-500">
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {data.industry && <p><span className="font-semibold">Industry:</span> {data.industry}</p>}
                        {data.websiteUrl && (
                            <p>
                                <span className="font-semibold">Website:</span>{' '}
                                <a href={data.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                    {data.websiteUrl}
                                </a>
                            </p>
                        )}
                        <button onClick={startEditing} className="text-blue-600 text-sm mt-2 self-start">
                            Edit
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}