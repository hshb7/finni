import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { PatientStatus } from '@/lib/constants'
import { PATIENT_STATUSES } from '@/lib/constants'
import { editStatusSchema } from '@/lib/schemas'
import type { EditStatusValues } from '@/lib/schemas'
import { useEditStatus } from '@/hooks/use-patients'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

const STATUS_COLOR_MAP: Record<PatientStatus, string> = {
  Inquiry: 'bg-status-inquiry',
  Onboarding: 'bg-status-onboarding',
  Active: 'bg-status-active',
  Churned: 'bg-status-churned',
}

const STATUS_TEXT_MAP: Record<PatientStatus, string> = {
  Inquiry: 'text-status-inquiry',
  Onboarding: 'text-status-onboarding',
  Active: 'text-status-active',
  Churned: 'text-status-churned',
}

interface EditStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: PatientStatus
  patientId: string
}

export function EditStatusDialog({
  open,
  onOpenChange,
  currentStatus,
  patientId,
}: EditStatusDialogProps) {
  const { mutate, isPending } = useEditStatus()

  const form = useForm<EditStatusValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editStatusSchema) as any,
    defaultValues: {
      status: currentStatus,
      notes: '',
      referral_source: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        status: currentStatus,
        notes: '',
        referral_source: '',
      })
    }
  }, [open, currentStatus, form])

  function onSubmit(values: EditStatusValues) {
    mutate(
      { id: patientId, data: values },
      {
        onSuccess: () => {
          toast.success('Status updated successfully')
          onOpenChange(false)
        },
        onError: () => {
          toast.error('Failed to update status')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Patient Status</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='flex items-center gap-2 text-sm'>
              <span className='text-muted-foreground'>Current status:</span>
              <span className={`size-2 rounded-full ${STATUS_COLOR_MAP[currentStatus]}`} />
              <span className={STATUS_TEXT_MAP[currentStatus]}>
                {currentStatus}
              </span>
            </div>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PATIENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          <span className='flex items-center gap-2'>
                            <span className={`size-2 rounded-full ${STATUS_COLOR_MAP[status]}`} />
                            {status}
                          </span>
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
                    <Textarea
                      placeholder='Reason for status change...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='referral_source'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Source (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Dr. Smith, website' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
