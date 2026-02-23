import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import type { Appointment, PatientDetail } from '@/lib/types'
import type { AppointmentStatus } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { AppointmentFormDialog } from './AppointmentFormDialog'

const appointmentStatusColors: Record<AppointmentStatus, string> = {
  Scheduled: 'text-primary',
  Completed: 'text-status-active',
  Cancelled: 'text-status-onboarding',
  'No-Show': 'text-status-churned',
}

const appointmentStatusDots: Record<AppointmentStatus, string> = {
  Scheduled: 'bg-primary',
  Completed: 'bg-status-active',
  Cancelled: 'bg-status-onboarding',
  'No-Show': 'bg-status-churned',
}

interface AppointmentsTabProps {
  patient: PatientDetail
}

export function AppointmentsTab({ patient }: AppointmentsTabProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Appointment | null>(null)

  const appointments = patient.appointments

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardAction>
            <Button variant='outline' size='sm' onClick={() => setCreateOpen(true)}>
              <CalendarPlus className='size-4' />
              Add Appointment
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <CalendarPlus className='text-muted-foreground mb-2 size-10' />
              <p className='text-muted-foreground text-sm'>No appointments yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='w-[60px]' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>{formatDateTime(apt.date_time)}</TableCell>
                    <TableCell>{apt.appointment_type}</TableCell>
                    <TableCell>{apt.provider_name}</TableCell>
                    <TableCell>{apt.duration_minutes} min</TableCell>
                    <TableCell>{apt.location || '--'}</TableCell>
                    <TableCell>
                      <span className='inline-flex items-center gap-1.5'>
                        <span className={cn('size-2 shrink-0 rounded-full', appointmentStatusDots[apt.status])} />
                        <span className={cn('text-sm', appointmentStatusColors[apt.status])}>
                          {apt.status}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant='ghost' size='xs' onClick={() => setEditingItem(apt)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AppointmentFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        patientId={patient.id}
        editingItem={null}
      />
      <AppointmentFormDialog
        open={editingItem !== null}
        onOpenChange={(open) => { if (!open) setEditingItem(null) }}
        patientId={patient.id}
        editingItem={editingItem}
      />
    </>
  )
}
