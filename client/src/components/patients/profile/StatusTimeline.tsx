import { useMemo } from 'react'
import type { StatusHistoryEntry } from '@/lib/types'
import { formatDate } from '@/lib/format'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface StatusTimelineProps {
  history: StatusHistoryEntry[]
}

const statusColorMap: Record<string, string> = {
  Inquiry: 'text-status-inquiry',
  Onboarding: 'text-status-onboarding',
  Active: 'text-status-active',
  Churned: 'text-status-churned',
}

const statusDotMap: Record<string, string> = {
  Inquiry: 'bg-status-inquiry',
  Onboarding: 'bg-status-onboarding',
  Active: 'bg-status-active',
  Churned: 'bg-status-churned',
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  const sorted = useMemo(
    () => [...history].sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()),
    [history]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status History</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className='text-sm text-muted-foreground text-center py-6'>No status history</p>
        ) : (
          <div className='relative space-y-0'>
            {sorted.map((entry, index) => (
              <div key={entry.id} className='flex gap-3'>
                <div className='flex flex-col items-center'>
                  <div className={`size-2.5 rounded-full mt-1.5 shrink-0 ${statusDotMap[entry.new_status] || 'bg-muted-foreground'}`} />
                  {index < sorted.length - 1 && (
                    <div className='w-px flex-1 bg-border' />
                  )}
                </div>
                <div className='pb-4'>
                  <p className='text-xs text-muted-foreground'>
                    {formatDate(entry.changed_at)}
                  </p>
                  {entry.old_status ? (
                    <p className='text-sm'>
                      <span className={statusColorMap[entry.old_status] || ''}>{entry.old_status}</span>
                      <span className='text-muted-foreground mx-1.5'>&rarr;</span>
                      <span className={statusColorMap[entry.new_status] || ''}>{entry.new_status}</span>
                    </p>
                  ) : (
                    <p className='text-sm'>
                      Created as{' '}
                      <span className={statusColorMap[entry.new_status] || ''}>{entry.new_status}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
