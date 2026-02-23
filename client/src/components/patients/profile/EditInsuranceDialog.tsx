import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { InsuranceInfo } from '@/lib/types'
import { insuranceSchema } from '@/lib/schemas'
import type { InsuranceValues } from '@/lib/schemas'
import { HOLDER_RELATIONSHIPS } from '@/lib/constants'
import { useEditInsurance } from '@/hooks/use-patients'
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

interface EditInsuranceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  insurance: InsuranceInfo | null
  patientId: string
}

export function EditInsuranceDialog({
  open,
  onOpenChange,
  insurance,
  patientId,
}: EditInsuranceDialogProps) {
  const { mutate, isPending } = useEditInsurance()

  const form = useForm<InsuranceValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(insuranceSchema) as any,
    defaultValues: {
      provider_name: insurance?.provider_name ?? '',
      policy_number: insurance?.policy_number ?? '',
      group_number: insurance?.group_number ?? '',
      holder_name: insurance?.holder_name ?? '',
      holder_relationship: insurance?.holder_relationship ?? 'Self',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        provider_name: insurance?.provider_name ?? '',
        policy_number: insurance?.policy_number ?? '',
        group_number: insurance?.group_number ?? '',
        holder_name: insurance?.holder_name ?? '',
        holder_relationship: insurance?.holder_relationship ?? 'Self',
      })
    }
  }, [open, insurance, form])

  function onSubmit(values: InsuranceValues) {
    mutate(
      { id: patientId, data: values },
      {
        onSuccess: () => {
          toast.success('Insurance information updated successfully')
          onOpenChange(false)
        },
        onError: () => {
          toast.error('Failed to update insurance information')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Insurance</DialogTitle>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='policy_number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='group_number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='holder_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holder Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='holder_relationship'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holder Relationship</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select relationship' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HOLDER_RELATIONSHIPS.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
