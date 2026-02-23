import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { PreferredPharmacy } from '@/lib/types'
import { pharmacySchema } from '@/lib/schemas'
import type { PharmacyValues } from '@/lib/schemas'
import { useEditPharmacy } from '@/hooks/use-patients'
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

interface EditPharmacyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pharmacy: PreferredPharmacy | null
  patientId: string
}

export function EditPharmacyDialog({
  open,
  onOpenChange,
  pharmacy,
  patientId,
}: EditPharmacyDialogProps) {
  const { mutate, isPending } = useEditPharmacy()

  const form = useForm<PharmacyValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pharmacySchema) as any,
    defaultValues: {
      name: pharmacy?.name ?? '',
      address: pharmacy?.address ?? '',
      phone: pharmacy?.phone ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: pharmacy?.name ?? '',
        address: pharmacy?.address ?? '',
        phone: pharmacy?.phone ?? '',
      })
    }
  }, [open, pharmacy, form])

  function onSubmit(values: PharmacyValues) {
    mutate(
      { id: patientId, data: values },
      {
        onSuccess: () => {
          toast.success('Pharmacy updated successfully')
          onOpenChange(false)
        },
        onError: () => {
          toast.error('Failed to update pharmacy')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Preferred Pharmacy</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
