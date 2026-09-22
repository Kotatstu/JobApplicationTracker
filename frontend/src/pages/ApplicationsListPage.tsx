import { Link } from 'react-router-dom'
import { Building2, Calendar, Inbox } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useJobApplications } from '../hooks/useJobApplications'

export function ApplicationsListPage() {
    const { data, isLoading, isError } = useJobApplications()

    if (isLoading) {
        return <p className="text-muted-foreground">Loading applications...</p>
    }

    if (isError) {
        return <p className="text-destructive">Failed to load applications.</p>
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Your Applications</h1>

            {data && data.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                        <Inbox className="h-8 w-8" />
                        <p>No applications yet — add your first one to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col gap-3">
                    {data?.map((app) => (
                        <Link key={app.id} to={`/applications/${app.id}`}>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="flex items-center justify-between py-4">
                                    <div>
                                        <p className="font-semibold">{app.jobTitle}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Building2 className="h-3.5 w-3.5" />
                                                {app.companyName}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(app.dateApplied).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">{app.currentStatus}</Badge>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}