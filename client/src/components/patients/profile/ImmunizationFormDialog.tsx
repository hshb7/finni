import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { Immunization } from '@/lib/types'
import { immunizationSchema } from '@/lib/schemas'
import type { ImmunizationValues } from '@/lib/schemas'
import { useCreateImmunization, useEditImmunization } from '@/hooks/use-immunizations'
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
import { Textarea } from '@/components/ui/textarea'

interface ImmunizationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  editingItem: Immunization | null
}

const defaultValues: ImmunizationValues = {
  vaccine_name: '',
  date_administered: '',
  administered_by: '',
  dose_number: undefined,
  lot_number: '',
  next_due_date: '',
  notes: '',
}

export function ImmunizationFormDialog({
  open,
  onOpenChange,
  patientId,
  editingItem,
}: ImmunizationFormDialogProps) {
  const isEditing = editingItem !== null

  const form = useForm<ImmunizationValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(immunizationSchema) as any,
    defaultValues,
  })

  const createMutation = useCreateImmunization()
  const editMutation = useEditImmunization(patientId)

  useEffect(() => {
    if (!open) return
    if (editingItem) {
      form.reset({
        vaccine_name: editingItem.vaccine_name,
        date_administered: editingItem.date_administered,
        administered_by: editingItem.administered_by ?? '',
        dose_number: editingItem.dose_number ?? undefined,
        lot_number: editingItem.lot_number ?? '',
        next_due_date: editingItem.next_due_date ?? '',
        notes: editingItem.notes ?? '',
      })
    } else {
      form.reset(defaultValues)
    }
  }, [open, editingItem, form])

  function onSubmit(data: ImmunizationValues) {
    if (isEditing) {
      editMutation.mutate(
        { id: editingItem.id, data },
        {
          onSuccess: () => {
            toast.success('Immunization updated')
            onOpenChange(false)
          },
          onError: () => {
            toast.error('Failed to update immunization')
          },
        },
      )
    } else {
      createMutation.mutate(
        { patientId, data },
        {
          onSuccess: () => {
            toast.success('Immunization created')
            onOpenChange(false)
          },
          onError: () => {
            toast.error('Failed to create immunization')
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
          <DialogTitle>{isEditing ? 'Edit Immunization' : 'Add Immunization'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='vaccine_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vaccine Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Influenza, MMR' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='date_administered'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Administered</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='administered_by'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Administered By</FormLabel>
                  <FormControl>
                    <Input placeholder='Dr. Smith' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dose_number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dose Number</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      placeholder='e.g. 1, 2, 3'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='lot_number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lot Number</FormLabel>
                  <FormControl>
                    <Input placeholder='Lot number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='next_due_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Due Date</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
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
                {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Immunization'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
