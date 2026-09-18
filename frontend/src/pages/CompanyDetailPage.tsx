import { useParams, Link } from 'react-router-dom'
import { useCompany } from '../hooks/useCompany'

export function CompanyDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { data, isLoading, isError } = useCompany(Number(id))

    if (isLoading) return <div className="p-8">Loading...</div>
    if (isError || !data) return <div className="p-8 text-red-600">Company not found.</div>

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link to="/" className="text-blue-600 text-sm">&larr; Back to applications</Link>

            <h1 className="text-2xl font-bold mt-2">{data.companyName}</h1>

            <div className="mt-4 flex flex-col gap-2 text-sm">
                {data.industry && <p><span className="font-semibold">Industry:</span> {data.industry}</p>}
                {data.websiteUrl && (
                    <p>
                        <span className="font-semibold">Website:</span>{' '}
                        <a href={data.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                            {data.websiteUrl}
                        </a>
                    </p>
                )}
            </div>
        </div>
    )
}