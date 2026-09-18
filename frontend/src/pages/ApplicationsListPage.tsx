import { Link } from 'react-router-dom'
import { useJobApplications } from '../hooks/useJobApplications'

export function ApplicationsListPage() {
    const { data, isLoading, isError } = useJobApplications()

    if (isLoading) return <div className="p-8">Loading applications...</div>
    if (isError) return <div className="p-8 text-red-600">Failed to load applications.</div>

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Job Applications</h1>
            {data && data.length === 0 ? (
                <p className="text-gray-500">No applications yet.</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {data?.map((app) => (
                        <li key={app.id} className="border rounded p-4 flex justify-between items-center">
                            <Link to={`/applications/${app.id}`} className="flex-1">
                                <div>
                                    <p className="font-semibold">{app.jobTitle}</p>
                                    <p className="text-sm text-gray-600">{app.companyName}</p>
                                </div>
                            </Link>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {app.currentStatus}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}