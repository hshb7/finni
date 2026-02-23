import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { Visit } from '@/lib/types'
import { visitSchema } from '@/lib/schemas'
import type { VisitValues } from '@/lib/schemas'
import { VISIT_TYPES } from '@/lib/constants'
import { useCreateVisit, useEditVisit } from '@/hooks/use-visits'
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
import { Checkbox } from '@/components/ui/checkbox'

interface VisitFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  editingItem: Visit | null
}

const defaultValues: VisitValues = {
  provider_name: '',
  visit_type: 'Check-up',
  visit_date: '',
  summary: '',
  diagnosis: '',
  follow_up_needed: false,
}

export function VisitFormDialog({
  open,
  onOpenChange,
  patientId,
  editingItem,
}: VisitFormDialogProps) {
  const isEditing = editingItem !== null

  const form = useForm<VisitValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(visitSchema) as any,
    defaultValues,
  })

  const createMutation = useCreateVisit()
  const editMutation = useEditVisit(patientId)

  useEffect(() => {
    if (!open) return
    if (editingItem) {
      form.reset({
        provider_name: editingItem.provider_name,
        visit_type: editingItem.visit_type,
        visit_date: editingItem.visit_date,
        summary: editingItem.summary ?? '',
        diagnosis: editingItem.diagnosis ?? '',
        follow_up_needed: editingItem.follow_up_needed,
      })
    } else {
      form.reset(defaultValues)
    }
  }, [open, editingItem, form])

  function onSubmit(data: VisitValues) {
    if (isEditing) {
      editMutation.mutate(
        { id: editingItem.id, data },
        {
          onSuccess: () => {
            toast.success('Visit updated')
            onOpenChange(false)
          },
          onError: () => {
            toast.error('Failed to update visit')
          },
        },
      )
    } else {
      createMutation.mutate(
        { patientId, data },
        {
          onSuccess: () => {
            toast.success('Visit created')
            onOpenChange(false)
          },
          onError: () => {
            toast.error('Failed to create visit')
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
          <DialogTitle>{isEditing ? 'Edit Visit' : 'Add Visit'}</DialogTitle>
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
              name='visit_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VISIT_TYPES.map((type) => (
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
              name='visit_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Date</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='summary'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Visit summary...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='diagnosis'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Diagnosis details...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='follow_up_needed'
              render={({ field }) => (
                <FormItem className='flex items-center gap-2 space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className='font-normal'>Follow-up Needed</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Visit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
