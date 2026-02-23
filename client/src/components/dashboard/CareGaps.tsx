import { useNavigate } from 'react-router'
import { AlertTriangle } from 'lucide-react'
import { useCareGaps } from '@/hooks/use-stats'
import { formatDate } from '@/lib/format'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function CareGaps() {
  const navigate = useNavigate()
  const { data, isLoading } = useCareGaps()

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <AlertTriangle className='size-5' />
          Care Gaps
          {data && data.total_count > 0 && (
            <span className='ml-auto text-sm font-normal text-muted-foreground'>
              {data.total_count} total
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Patients needing follow-up with no appointment scheduled
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col min-h-0 overflow-hidden'>
        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-14 w-full' />
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            No care gaps — all follow-ups are scheduled
          </p>
        ) : (
          <div className='-mr-2 h-0 flex-1 space-y-2 overflow-auto pr-2'>
            {data?.items.map((item) => (
              <div
                key={`${item.patient_id}-${item.visit_date}`}
                className='flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50'
                onClick={() => navigate(`/patients/${item.patient_id}`)}
              >
                <div className='min-w-0'>
                  <p className='truncate font-medium'>{item.patient_name}</p>
                  <p className='text-sm text-muted-foreground'>
                    Last visit: {formatDate(item.visit_date)}
                    {item.diagnosis && ` — ${item.diagnosis}`}
                  </p>
                </div>
                <span
                  className={`ml-2 shrink-0 text-sm font-medium ${
                    item.days_since_visit >= 30
                      ? 'text-status-churned'
                      : 'text-status-onboarding'
                  }`}
                >
                  {item.days_since_visit}d overdue
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
