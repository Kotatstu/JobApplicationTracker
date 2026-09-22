import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CompanyPicker } from '../components/CompanyPicker'
import { useJobApplication } from '../hooks/useJobApplication'
import { useUpdateJobApplication } from '../hooks/useUpdateJobApplication'

export function EditApplicationPage() {
  const { id } = useParams<{ id: string }>()
  const applicationId = Number(id)

  const { data, isLoading } = useJobApplication(applicationId)
  const updateMutation = useUpdateJobApplication(applicationId)
  const navigate = useNavigate()

  const [companyId, setCompanyId] = useState<number | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobPostingUrl, setJobPostingUrl] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

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
    setError(null)

    try {
      await updateMutation.mutateAsync({
        companyId: companyId ?? undefined,
        jobTitle,
        jobPostingUrl,
        location,
        notes,
      })
      toast.success('Application updated')
      navigate(`/applications/${applicationId}`)
    } catch {
      setError('Could not save changes.')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-4">
      <Link to={`/applications/${applicationId}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to application
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Application</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
            )}

            <div className="flex flex-col gap-1.5">
              <Label>Company</Label>
              <CompanyPicker value={companyId} onChange={(id) => setCompanyId(id)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jobPostingUrl">Job Posting URL</Label>
              <Input id="jobPostingUrl" value={jobPostingUrl} onChange={(e) => setJobPostingUrl(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>

            <Button type="submit" disabled={updateMutation.isPending} className="mt-2">
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}