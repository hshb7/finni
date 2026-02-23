import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { MedicalInfo } from '@/lib/types'
import { medicalSchema } from '@/lib/schemas'
import type { MedicalValues } from '@/lib/schemas'
import { useEditMedical } from '@/hooks/use-patients'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface EditMedicalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medical: MedicalInfo | null
  patientId: string
}

export function EditMedicalDialog({
  open,
  onOpenChange,
  medical,
  patientId,
}: EditMedicalDialogProps) {
  const { mutate, isPending } = useEditMedical()

  const form = useForm<MedicalValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(medicalSchema) as any,
    defaultValues: {
      primary_diagnosis: medical?.primary_diagnosis ?? '',
      allergies: medical?.allergies ?? '',
      current_medications: medical?.current_medications ?? '',
      additional_conditions: medical?.additional_conditions ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        primary_diagnosis: medical?.primary_diagnosis ?? '',
        allergies: medical?.allergies ?? '',
        current_medications: medical?.current_medications ?? '',
        additional_conditions: medical?.additional_conditions ?? '',
      })
    }
  }, [open, medical, form])

  function onSubmit(values: MedicalValues) {
    mutate(
      { id: patientId, data: values },
      {
        onSuccess: () => {
          toast.success('Medical information updated successfully')
          onOpenChange(false)
        },
        onError: () => {
          toast.error('Failed to update medical information')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Medical Information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='primary_diagnosis'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Diagnosis</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='allergies'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='current_medications'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Medications</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='additional_conditions'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Conditions</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
