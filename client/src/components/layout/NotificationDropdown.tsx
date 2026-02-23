import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

import { CalendarIcon, AlertTriangleIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'

import { useRecentAppointments, useCareGaps } from '@/hooks/use-stats'
import { formatDateTime } from '@/lib/format'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

function getInitials(name: string): string {
  const parts = name.split(/[\s,]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return (parts[0]?.[0] ?? '?').toUpperCase()
}

function SkeletonItems() {
  return (
    <div className='space-y-1 p-2'>
      {[1, 2, 3].map(i => (
        <div key={i} className='flex items-center gap-3 px-2 py-3'>
          <Skeleton className='size-9.5 rounded-full' />
          <div className='flex-1 space-y-1.5'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-48' />
          </div>
        </div>
      ))}
    </div>
  )
}

const NotificationDropdown = ({ trigger, defaultOpen, align = 'end' }: Props) => {
  const navigate = useNavigate()
  const { data: appointmentsData, isLoading: loadingAppts } = useRecentAppointments()
  const { data: careGapsData, isLoading: loadingGaps } = useCareGaps()

  const upcoming = appointmentsData?.upcoming ?? []
  const careGaps = careGapsData?.items ?? []
  const totalCount = upcoming.length + careGaps.length

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className='max-w-xs sm:max-w-122' align={align || 'end'}>
        <Tabs defaultValue='inbox' className='gap-0'>
          <DropdownMenuLabel className='flex flex-col pb-0'>
            <div className='flex items-center justify-between gap-6 pb-2.5'>
              <span className='text-muted-foreground text-base font-normal uppercase'>Notifications</span>
              {totalCount > 0 && (
                <span className='text-sm text-primary'>{totalCount} New</span>
              )}
            </div>
            <div className='-mb-0.5 flex items-center justify-between gap-4'>
              <TabsList className='relative h-fit rounded-none bg-transparent p-0'>
                <TabsTrigger
                  value='inbox'
                  className='data-[state=active]:!border-b-primary rounded-none border-b-2 border-b-transparent font-normal data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent'
                >
                  Inbox
                </TabsTrigger>
                <TabsTrigger
                  value='general'
                  className='data-[state=active]:!border-b-primary rounded-none border-b-2 border-b-transparent font-normal data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent'
                >
                  General
                </TabsTrigger>
              </TabsList>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className='mt-0 h-0.5' />

          <TabsContent value='inbox'>
            {loadingAppts ? (
              <SkeletonItems />
            ) : upcoming.length === 0 ? (
              <div className='flex flex-col items-center gap-2 py-8 text-center'>
                <CalendarIcon className='text-muted-foreground size-8' />
                <p className='text-muted-foreground text-sm'>No upcoming appointments</p>
              </div>
            ) : (
              upcoming.map((appt, i) => (
                <div key={appt.id}>
                  <DropdownMenuItem
                    className='cursor-pointer gap-3 px-2 py-3 text-base'
                    onSelect={() => navigate(`/patients/${appt.patient_id}`)}
                  >
                    <Avatar className='size-9.5'>
                      <AvatarFallback>{getInitials(appt.patient_name)}</AvatarFallback>
                    </Avatar>
                    <div className='flex w-full flex-col items-start'>
                      <span className='text-base font-medium'>{appt.patient_name}</span>
                      <div className='flex items-center gap-2.5'>
                        <span className='text-muted-foreground text-sm'>{formatDateTime(appt.date_time)}</span>
                        <div className='bg-muted size-1.5 rounded-full' />
                        <span className='text-muted-foreground text-sm'>{appt.appointment_type}</span>
                      </div>
                      <span className='text-muted-foreground text-xs'>with {appt.provider_name}</span>
                    </div>
                    <div className='flex flex-col items-center gap-3'>
                      <div className='bg-status-inquiry size-1.5 rounded-full' />
                    </div>
                  </DropdownMenuItem>
                  {i < upcoming.length - 1 && <DropdownMenuSeparator />}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value='general'>
            {loadingGaps ? (
              <SkeletonItems />
            ) : careGaps.length === 0 ? (
              <div className='flex flex-col items-center gap-2 py-8 text-center'>
                <AlertTriangleIcon className='text-muted-foreground size-8' />
                <p className='text-muted-foreground text-sm'>No care gaps found</p>
              </div>
            ) : (
              careGaps.map((gap, i) => (
                <div key={`${gap.patient_id}-${gap.visit_date}`}>
                  <DropdownMenuItem
                    className='cursor-pointer gap-3 px-2 py-3 text-base'
                    onSelect={() => navigate(`/patients/${gap.patient_id}`)}
                  >
                    <Avatar className='size-9.5'>
                      <AvatarFallback>{getInitials(gap.patient_name)}</AvatarFallback>
                    </Avatar>
                    <div className='flex w-full flex-col items-start'>
                      <span className='text-base font-medium'>{gap.patient_name}</span>
                      <div className='flex items-center gap-2.5'>
                        <span className='text-muted-foreground text-sm'>{gap.days_since_visit} days since last visit</span>
                      </div>
                      {gap.diagnosis && (
                        <span className='text-muted-foreground text-xs'>{gap.diagnosis}</span>
                      )}
                    </div>
                    <div className='flex flex-col items-center gap-3'>
                      <div className='bg-status-churned size-1.5 rounded-full' />
                    </div>
                  </DropdownMenuItem>
                  {i < careGaps.length - 1 && <DropdownMenuSeparator />}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationDropdown
