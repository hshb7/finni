import type { StatsOverview } from '@/lib/types'
import type { PatientStatus } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  UserSearch,
  UserPlus,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'

interface StatsCardsProps {
  data: StatsOverview | undefined
  isLoading: boolean
}

const statusConfig: Record<
  PatientStatus,
  { icon: typeof Users; colorClass: string }
> = {
  Inquiry: {
    icon: UserSearch,
    colorClass: 'text-status-inquiry',
  },
  Onboarding: {
    icon: UserPlus,
    colorClass: 'text-status-onboarding',
  },
  Active: {
    icon: UserCheck,
    colorClass: 'text-status-active',
  },
  Churned: {
    icon: UserX,
    colorClass: 'text-status-churned',
  },
}

const statusOrder: PatientStatus[] = ['Inquiry', 'Onboarding', 'Active', 'Churned']

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-5'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className='flex items-center gap-3'>
              <Skeleton className='size-10 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-7 w-12' />
                <Skeleton className='h-4 w-16' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const countMap = new Map(
    data?.status_counts.map((s) => [s.status, s.count]) ?? []
  )

  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-5'>
      {statusOrder.map((status) => {
        const config = statusConfig[status]
        const Icon = config.icon
        return (
          <Card key={status}>
            <CardContent className='flex items-center gap-3'>
              <div className={`rounded-full bg-muted p-2.5 ${config.colorClass}`}>
                <Icon className='size-5' />
              </div>
              <div>
                <p className='text-3xl font-bold'>{countMap.get(status) ?? 0}</p>
                <p className='text-sm text-muted-foreground'>{status}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
      <Card>
        <CardContent className='flex items-center gap-3'>
          <div className='rounded-full bg-muted p-2.5 text-primary'>
            <Users className='size-5' />
          </div>
          <div>
            <p className='text-3xl font-bold'>{data?.total_patients ?? 0}</p>
            <p className='text-sm text-muted-foreground'>Total</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
