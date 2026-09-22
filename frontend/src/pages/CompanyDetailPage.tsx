import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Globe, Briefcase, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompany } from '../hooks/useCompany'
import { useUpdateCompany } from '../hooks/useUpdateCompany'

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const companyId = Number(id)

  const { data, isLoading, isError } = useCompany(companyId)
  const updateMutation = useUpdateCompany(companyId)

  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftWebsite, setDraftWebsite] = useState('')
  const [draftIndustry, setDraftIndustry] = useState('')
  const [conflictError, setConflictError] = useState<string | null>(null)

  const startEditing = () => {
    if (!data) return
    setDraftName(data.companyName)
    setDraftWebsite(data.websiteUrl ?? '')
    setDraftIndustry(data.industry ?? '')
    setConflictError(null)
    setIsEditing(true)
  }

  const saveCompany = async () => {
    try {
      await updateMutation.mutateAsync({
        companyName: draftName,
        websiteUrl: draftWebsite,
        industry: draftIndustry,
      })
      toast.success('Company updated')
      setIsEditing(false)
    } catch (err: any) {
      if (err.response?.status === 409) {
        setConflictError('A company with this name already exists.')
      } else {
        setConflictError('Could not save changes.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return <p className="text-destructive">Company not found.</p>
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to applications
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">{data.companyName}</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isEditing ? (
            <>
              {conflictError && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{conflictError}</p>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" value={draftIndustry} onChange={(e) => setDraftIndustry(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={draftWebsite} onChange={(e) => setDraftWebsite(e.target.value)} placeholder="https://..." />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={saveCompany} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              {data.industry && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  {data.industry}
                </span>
              )}
              {data.websiteUrl && (
                <a href={data.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline w-fit"><Globe className="h-4 w-4" />{data.websiteUrl}</a>
              )}
              {!data.industry && !data.websiteUrl && (
                <p className="text-muted-foreground">No additional details yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}