import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
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
      toast.success('Application created')
      navigate(`/applications/${created.id}`)
    } catch {
      setError('Could not create application — check the company is valid.')
    }
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-4">
      <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to applications
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>New Application</CardTitle>
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
              <Label htmlFor="dateApplied">Date Applied</Label>
              <Input id="dateApplied" type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jobPostingUrl">Job Posting URL</Label>
              <Input id="jobPostingUrl" value={jobPostingUrl} onChange={(e) => setJobPostingUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote, City, etc." />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>

            <Button type="submit" disabled={createMutation.isPending} className="mt-2">
              {createMutation.isPending ? 'Creating...' : 'Create Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}