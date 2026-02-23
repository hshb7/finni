import { useState } from 'react'
import { useNavigate } from 'react-router'
import { format, parseISO, addMinutes, isSameDay } from 'date-fns'
import { CalendarClock } from 'lucide-react'
import { useRecentAppointments } from '@/hooks/use-stats'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import type { RecentAppointmentItem } from '@/lib/types'

const statusBarColors: Record<string, string> = {
  Scheduled: 'bg-primary',
  Completed: 'bg-status-active',
  Cancelled: 'bg-status-onboarding',
  'No-Show': 'bg-status-churned',
}

const statusTextColors: Record<string, string> = {
  Scheduled: 'text-primary',
  Completed: 'text-status-active',
  Cancelled: 'text-status-onboarding',
  'No-Show': 'text-status-churned',
}

function formatTimeRange(appt: RecentAppointmentItem) {
  const start = parseISO(appt.date_time)
  const end = addMinutes(start, appt.duration_minutes ?? 30)
  return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`
}

export function RecentAppointments() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const monthParam = format(currentMonth, 'yyyy-MM')
  const { data, isLoading } = useRecentAppointments(monthParam)

  const upcoming = data?.upcoming ?? []

  // Compute dates that have appointments for calendar dot markers
  const dateSet = new Set<string>()
  for (const appt of upcoming) {
    dateSet.add(format(parseISO(appt.date_time), 'yyyy-MM-dd'))
  }
  const datesWithAppointments = Array.from(dateSet).map((d) => parseISO(d))

  // Filter appointments for the selected date
  const selectedDayAppointments = upcoming.filter((appt) =>
    isSameDay(parseISO(appt.date_time), selectedDate)
  )

  function handleMonthChange(month: Date) {
    setCurrentMonth(month)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-4'>
          <Skeleton className='h-[280px] w-full rounded-lg' />
        </CardContent>
        <CardFooter className='flex-col items-start gap-3 border-t px-4 py-4'>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-16 w-full' />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className='px-4 pt-0 pb-0'>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          month={currentMonth}
          onMonthChange={handleMonthChange}
          modifiers={{ hasAppointment: datesWithAppointments }}
          modifiersClassNames={{ hasAppointment: 'appointment-dot' }}
          className='w-full bg-transparent px-0 pt-0 pb-0'
          classNames={{ root: 'w-full', caption_label: 'text-base font-semibold select-none' }}
          required
        />
      </CardContent>
      <CardFooter className='flex-col items-start gap-3 border-t px-4 py-4'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CalendarClock className='size-4 text-muted-foreground' />
            <span className='text-sm font-medium'>
              {format(selectedDate, 'MMMM d, yyyy')}
            </span>
          </div>
          {selectedDayAppointments.length > 0 && (
            <span className='text-sm text-muted-foreground'>
              {selectedDayAppointments.length} appointment{selectedDayAppointments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {selectedDayAppointments.length === 0 ? (
          <p className='w-full py-4 text-center text-sm text-muted-foreground'>
            No appointments on this date
          </p>
        ) : (
          <div className='flex w-full flex-col gap-2'>
            {selectedDayAppointments.map((appt) => (
              <button
                key={appt.id}
                type='button'
                className='flex w-full items-start gap-3 rounded-lg bg-muted/50 p-3 text-left transition-colors hover:bg-muted'
                onClick={() => navigate(`/patients/${appt.patient_id}`)}
              >
                <div
                  className={`mt-1 h-8 w-1 shrink-0 rounded-full ${statusBarColors[appt.status] ?? 'bg-muted-foreground'}`}
                />
                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                  <span className='truncate text-sm font-medium'>
                    {appt.patient_name}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {formatTimeRange(appt)}
                  </span>
                  <div className='mt-1 flex items-center gap-3 text-xs'>
                    <span className='text-muted-foreground'>{appt.appointment_type}</span>
                    <span className={statusTextColors[appt.status] ?? 'text-muted-foreground'}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
