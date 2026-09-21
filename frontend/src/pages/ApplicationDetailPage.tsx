import { useParams, Link } from 'react-router-dom'
import { useJobApplication } from '../hooks/useJobApplication'
import { type Key, type ReactElement, type JSXElementConstructor, type ReactNode, type ReactPortal, useState } from 'react'
import { useStatusHistory } from '../hooks/useStatusHistory'
import { usePostingDetails } from '../hooks/usePostingDetails'
import { useUpdateStatus } from '../hooks/useUpdateStatus'
import { useUpsertPostingDetails } from '../hooks/useUpsertJobPostingDetails'

export function ApplicationDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { data, isLoading, isError } = useJobApplication(Number(id))
    const { data: history } = useStatusHistory(Number(id))
    const { data: postingDetails } = usePostingDetails(Number(id))
    const [newStatus, setNewStatus] = useState('')
    const [statusNote, setStatusNote] = useState('')
    const updateStatusMutation = useUpdateStatus(Number(id))
    const [isEditingPosting, setIsEditingPosting] = useState(false)
    const [draftRawText, setDraftRawText] = useState('')
    const upsertMutation = useUpsertPostingDetails(Number(id))

    if (isLoading) return <div className="p-8">Loading...</div>
    if (isError || !data) return <div className="p-8 text-red-600">Application not found.</div>

    const handleStatusChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newStatus.trim()) return
        await updateStatusMutation.mutateAsync({ status: newStatus, note: statusNote || undefined })
        setNewStatus('')
        setStatusNote('')
    }

    const startEditingPosting = () => {
        setDraftRawText(postingDetails?.detail?.rawText ?? '')
        setIsEditingPosting(true)
    }

    const savePostingDetails = async () => {
        await upsertMutation.mutateAsync(draftRawText)
        setIsEditingPosting(false)
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link to="/" className="text-blue-600 text-sm">&larr; Back to applications</Link>

            <h1 className="text-2xl font-bold mt-2">{data.jobTitle}</h1>
            <Link to={`/companies/${data.companyId}`} className="text-gray-600 hover:underline">
                {data.companyName}
            </Link>

            <div className="mt-4 flex flex-col gap-2 text-sm">
                <p><span className="font-semibold">Status:</span> {data.currentStatus}</p>
                <p><span className="font-semibold">Applied:</span> {new Date(data.dateApplied).toLocaleDateString()}</p>
                {data.location && <p><span className="font-semibold">Location:</span> {data.location}</p>}
                {data.jobPostingUrl && (
                    <p>
                        <span className="font-semibold">Posting:</span>{' '}
                        <a href={data.jobPostingUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                            View original
                        </a>
                    </p>
                )}
                <p><span className="font-semibold">Added via:</span> {data.createVia}</p>
                <p className="text-xs text-gray-400">
                    Created {new Date(data.createdAt).toLocaleString()} · Last updated {new Date(data.updatedAt).toLocaleString()}
                </p>
                {data.notes && <p><span className="font-semibold">Notes:</span> {data.notes}</p>}
            </div>

            <div className="mt-6">
                <h2 className="font-semibold mb-2">Status History</h2>
                <ul className="flex flex-col gap-1 text-sm">
                    {history?.map((entry: { id: Key | null | undefined; status: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; changedAt: string | number | Date; note: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }) => (
                        <li key={entry.id} className="border-l-2 border-blue-400 pl-3">
                            <span className="font-medium">{entry.status}</span>{' '}
                            <span className="text-gray-500">
                                — {new Date(entry.changedAt).toLocaleDateString()}
                            </span>
                            {entry.note && <p className="text-gray-600 italic">{entry.note}</p>}
                        </li>
                    ))}
                </ul>
            </div>

            <form onSubmit={handleStatusChange} className="mt-2 flex gap-2 items-end">
                <input
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    placeholder="New status (e.g. Interviewing)"
                    className="border rounded px-2 py-1 text-sm"
                />
                <input
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Note (optional)"
                    className="border rounded px-2 py-1 text-sm"
                />
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    Update
                </button>
            </form>

            <div className="mt-6">
                <h2 className="font-semibold mb-2">Posting Details</h2>
                {isEditingPosting ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={draftRawText}
                            onChange={(e) => setDraftRawText(e.target.value)}
                            rows={8}
                            className="border rounded px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                            <button onClick={savePostingDetails} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Save</button>
                            <button onClick={() => setIsEditingPosting(false)} className="text-sm text-gray-500">Cancel</button>
                        </div>
                    </div>
                ) : postingDetails?.hasDetails ? (
                    <div>
                        <p className="text-sm whitespace-pre-wrap">{postingDetails.detail?.rawText}</p>
                        <button onClick={startEditingPosting} className="text-blue-600 text-sm mt-2">Edit</button>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-500">No posting details saved yet.</p>
                        <button onClick={startEditingPosting} className="text-blue-600 text-sm mt-1">+ Add posting details</button>
                    </div>
                )}
            </div>

        </div>

        
    )
}