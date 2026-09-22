import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Building2, MapPin, Calendar, ExternalLink, Pencil, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useJobApplication } from '../hooks/useJobApplication'
import { useStatusHistory } from '../hooks/useStatusHistory'
import { usePostingDetails } from '../hooks/usePostingDetails'
import { useUpdateStatus } from '../hooks/useUpdateStatus'
import { useUpsertPostingDetails } from '../hooks/useUpsertJobPostingDetails'

export function ApplicationDetailPage() {
    const { id } = useParams<{ id: string }>()
    const applicationId = Number(id)

    const { data, isLoading, isError } = useJobApplication(applicationId)
    const { data: history } = useStatusHistory(applicationId)
    const { data: postingDetails } = usePostingDetails(applicationId)
    const updateStatusMutation = useUpdateStatus(applicationId)
    const upsertMutation = useUpsertPostingDetails(applicationId)

    const [newStatus, setNewStatus] = useState('')
    const [statusNote, setStatusNote] = useState('')
    const [isEditingPosting, setIsEditingPosting] = useState(false)
    const [draftRawText, setDraftRawText] = useState('')

    const handleStatusChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newStatus.trim()) return
        await updateStatusMutation.mutateAsync({ status: newStatus, note: statusNote || undefined })
        toast.success(`Status updated to "${newStatus}"`)
        setNewStatus('')
        setStatusNote('')
    }

    const startEditingPosting = () => {
        setDraftRawText(postingDetails?.detail?.rawText ?? '')
        setIsEditingPosting(true)
    }

    const savePostingDetails = async () => {
        await upsertMutation.mutateAsync(draftRawText)
        toast.success('Posting details saved')
        setIsEditingPosting(false)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }

    if (isError || !data) {
        return <p className="text-destructive">Application not found.</p>
    }

    return (
        <div className="flex flex-col gap-6 max-w-3xl">
            <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
                <ArrowLeft className="h-4 w-4" />
                Back to applications
            </Link>

            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl">{data.jobTitle}</CardTitle>
                        <Link
                            to={`/companies/${data.companyId}`}
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary hover:underline w-fit mt-1"
                        >
                            <Building2 className="h-4 w-4" />
                            {data.companyName}
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge>{data.currentStatus}</Badge>
                        <Link to={`/applications/${applicationId}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            Applied {new Date(data.dateApplied).toLocaleDateString()}
                        </span>
                        {data.location && (
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {data.location}
                            </span>
                        )}
                        {data.jobPostingUrl && (
                            <a href={data.jobPostingUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline"><ExternalLink className="h-4 w-4" />View posting</a>
                        )}
                    </div>

                    {data.notes && (
                        <>
                            <Separator />
                            <p className="text-sm">{data.notes}</p>
                        </>
                    )}

                    <p className="text-xs text-muted-foreground mt-1">
                        Added via {data.createVia} · Last updated {new Date(data.updatedAt).toLocaleString()}
                    </p>
                </CardContent>
            </Card>

            {/* Status change */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Update Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleStatusChange} className="flex flex-col sm:flex-row gap-2">
                        <Input
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            placeholder="e.g. Interviewing"
                            className="sm:flex-1"
                        />
                        <Input
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            placeholder="Note (optional)"
                            className="sm:flex-1"
                        />
                        <Button type="submit" disabled={updateStatusMutation.isPending || !newStatus.trim()}>
                            Update
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Status history */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Status History</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="flex flex-col gap-4">
                        {history?.map((entry) => (
                            <li key={entry.id} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
                                    <div className="w-px flex-1 bg-border mt-1" />
                                </div>
                                <div className="pb-2">
                                    <p className="font-medium text-sm">{entry.status}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(entry.changedAt).toLocaleString()}
                                    </p>
                                    {entry.note && <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>}
                                </div>
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>

            {/* Posting details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Posting Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditingPosting ? (
                        <div className="flex flex-col gap-2">
                            <Textarea
                                value={draftRawText}
                                onChange={(e) => setDraftRawText(e.target.value)}
                                rows={10}
                                placeholder="Paste the full job posting here..."
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={savePostingDetails} disabled={upsertMutation.isPending}>
                                    Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditingPosting(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : postingDetails?.hasDetails ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                {postingDetails.detail?.rawText}
                            </p>
                            <Button size="sm" variant="outline" className="w-fit" onClick={startEditingPosting}>
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start gap-2">
                            <p className="text-sm text-muted-foreground">No posting details saved yet.</p>
                            <Button size="sm" variant="outline" onClick={startEditingPosting}>
                                + Add posting details
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}