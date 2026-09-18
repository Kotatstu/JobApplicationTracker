export interface StatusHistoryEntry {
    id: number
    status: string
    changedAt: string
    note: string | null
    source: string
}