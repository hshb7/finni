import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import type { EmergencyContact } from '@/lib/types'
import { emergencyContactsSchema } from '@/lib/schemas'
import type { EmergencyContactsValues } from '@/lib/schemas'
import { RELATIONSHIPS } from '@/lib/constants'
import { useEditContacts } from '@/hooks/use-patients'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

interface EditContactsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: EmergencyContact[]
  patientId: string
}

const emptyContact = {
  name: '',
  relationship: 'Parent' as const,
  phone: '',
  email: '',
  is_primary: false,
}

export function EditContactsDialog({
  open,
  onOpenChange,
  contacts,
  patientId,
}: EditContactsDialogProps) {
  const { mutate, isPending } = useEditContacts()

  const form = useForm<EmergencyContactsValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(emergencyContactsSchema) as any,
    defaultValues: {
      contacts: contacts.length > 0
        ? contacts.map((c) => ({
            name: c.name,
            relationship: c.relationship,
            phone: c.phone,
            email: c.email ?? '',
            is_primary: c.is_primary,
          }))
        : [emptyContact],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts',
  })

  useEffect(() => {
    if (open) {
      form.reset({
        contacts: contacts.length > 0
          ? contacts.map((c) => ({
              name: c.name,
              relationship: c.relationship,
              phone: c.phone,
              email: c.email ?? '',
              is_primary: c.is_primary,
            }))
          : [emptyContact],
      })
    }
  }, [open, contacts, form])

  function onSubmit(values: EmergencyContactsValues) {
    mutate(
      { id: patientId, data: { contacts: values.contacts } },
      {
        onSuccess: () => {
          toast.success('Emergency contacts updated successfully')
          onOpenChange(false)
        },
        onError: () => {
          toast.error('Failed to update emergency contacts')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit Emergency Contacts</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-6'>
              {fields.map((field, index) => (
                <div key={field.id} className='space-y-4 rounded-lg border p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      Contact {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => remove(index)}
                      >
                        <Trash2 className='size-4' />
                      </Button>
                    )}
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.name`}
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
                      name={`contacts.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
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
                              {RELATIONSHIPS.map((rel) => (
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
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.phone`}
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
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type='email' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.is_primary`}
                    render={({ field }) => (
                      <FormItem className='flex items-center gap-2'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className='!mt-0'>Primary contact</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => append(emptyContact)}
            >
              <Plus className='mr-1 size-4' />
              Add Contact
            </Button>
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
