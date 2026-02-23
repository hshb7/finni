import { useFieldArray } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import type { CreatePatientValues } from '@/lib/schemas'
import { RELATIONSHIPS } from '@/lib/constants'
import {
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

interface Step3EmergencyContactsProps {
  form: UseFormReturn<CreatePatientValues>
}

const emptyContact = {
  name: '',
  relationship: 'Parent' as const,
  phone: '',
  email: '',
  is_primary: false,
}

export function Step3EmergencyContacts({ form }: Step3EmergencyContactsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'emergency_contacts',
  })

  return (
    <div className='space-y-4'>
      <p className='text-muted-foreground text-sm'>
        Emergency contacts are optional. You can skip this step and add contacts later from the patient profile.
      </p>

      {fields.length === 0 ? (
        <div className='flex flex-col items-center gap-3 rounded-lg border border-dashed p-8'>
          <p className='text-muted-foreground text-sm'>No emergency contacts added yet.</p>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => append(emptyContact)}
          >
            <Plus className='mr-1 size-4' />
            Add Contact
          </Button>
        </div>
      ) : (
        <>
          <div className='space-y-6'>
            {fields.map((field, index) => (
              <div key={field.id} className='space-y-4 rounded-lg border p-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    Contact {index + 1}
                  </span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => remove(index)}
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name={`emergency_contacts.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder='Jane Doe' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`emergency_contacts.${index}.relationship`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship *</FormLabel>
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
                    name={`emergency_contacts.${index}.phone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder='(555) 123-4567' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`emergency_contacts.${index}.email`}
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
                  name={`emergency_contacts.${index}.is_primary`}
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
            Add Another Contact
          </Button>
        </>
      )}
    </div>
  )
}
