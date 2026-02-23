import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { Appointment } from '@/lib/types'
import { appointmentSchema } from '@/lib/schemas'
import type { AppointmentValues } from '@/lib/schemas'
import { APPOINTMENT_TYPES, APPOINTMENT_STATUSES } from '@/lib/constants'
import { toDatetimeLocal } from '@/lib/format'
import { useCreateAppointment, useEditAppointment } from '@/hooks/use-appointments'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface AppointmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  editingItem: Appointment | null
}

const defaultValues: AppointmentValues = {
  provider_name: '',
  appointment_type: 'Check-up',
  date_time: '',
  duration_minutes: 30,
  location: '',
  status: 'Scheduled',
  notes: '',
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  patientId,
  editingItem,
}: AppointmentFormDialogProps) {
  const isEditing = editingItem !== null

  const form = useForm<AppointmentValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(appointmentSchema) as any,
    defaultValues,
  })

  const createMutation = useCreateAppointment()
  const editMutation = useEditAppointment(patientId)

  useEffect(() => {
    if (!open) return
    if (editingItem) {
      form.reset({
        provider_name: editingItem.provider_name,
        appointment_type: editingItem.appointment_type,
        date_time: toDatetimeLocal(editingItem.date_time),
        duration_minutes: editingItem.duration_minutes,
        location: editingItem.location ?? '',
        status: editingItem.status,
        notes: editingItem.notes ?? '',
      })
    } else {
      form.reset(defaultValues)
    }
  }, [open, editingItem, form])

  function onSubmit(data: AppointmentValues) {
    if (isEditing) {
      editMutation.mutate(
        { id: editingItem.id, data },
        {
          onSuccess: () => {
            toast.success('Appointment updated')
            onOpenChange(false)
          },
          onError: () => {
            toast.error('Failed to update appointment')
          },
        },
      )
    } else {
      createMutation.mutate(
        { patientId, data },
        {
          onSuccess: () => {
            toast.success('Appointment created')
            onOpenChange(false)
          },
          onError: () => {
            toast.error('Failed to create appointment')
          },
        },
      )
    }
  }

  const isPending = createMutation.isPending || editMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Appointment' : 'Add Appointment'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='provider_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Dr. Smith' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='appointment_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {APPOINTMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='date_time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input type='datetime-local' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='duration_minutes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type='number' min={5} step={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder='Office, Room 201' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {APPOINTMENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Additional notes...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
