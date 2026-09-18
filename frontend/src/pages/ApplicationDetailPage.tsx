import { useParams, Link } from 'react-router-dom'
import { useJobApplication } from '../hooks/useJobApplication'
import type { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react'
import { useStatusHistory } from '../hooks/useStatusHistory'
import { usePostingDetails } from '../hooks/usePostingDetails'

export function ApplicationDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { data, isLoading, isError } = useJobApplication(Number(id))
    const { data: history } = useStatusHistory(Number(id))
    const { data: postingDetails } = usePostingDetails(Number(id))

    if (isLoading) return <div className="p-8">Loading...</div>
    if (isError || !data) return <div className="p-8 text-red-600">Application not found.</div>

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

            <div className="mt-6">
                <h2 className="font-semibold mb-2">Posting Details</h2>
                {postingDetails?.hasDetails ? (
                    <p className="text-sm whitespace-pre-wrap">{postingDetails.detail?.rawText}</p>
                ) : (
                    <p className="text-sm text-gray-500">No posting details saved yet.</p>
                )}
            </div>

        </div>

        
    )
}