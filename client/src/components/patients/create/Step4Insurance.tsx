import type { UseFormReturn } from 'react-hook-form'
import type { CreatePatientValues } from '@/lib/schemas'
import { HOLDER_RELATIONSHIPS } from '@/lib/constants'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

interface Step4InsuranceProps {
  form: UseFormReturn<CreatePatientValues>
}

export function Step4Insurance({ form }: Step4InsuranceProps) {
  return (
    <div className='space-y-4'>
      <p className='text-muted-foreground text-sm'>
        Insurance information is optional. You can skip this step and add it later from the patient profile.
      </p>
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='insurance.provider_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Name</FormLabel>
              <FormControl>
                <Input placeholder='Blue Cross Blue Shield' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='insurance.policy_number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy Number</FormLabel>
              <FormControl>
                <Input placeholder='POL-123456' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='insurance.group_number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Number</FormLabel>
              <FormControl>
                <Input placeholder='GRP-789' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='insurance.holder_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Holder Name</FormLabel>
              <FormControl>
                <Input placeholder='John Doe' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='insurance.holder_relationship'
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
      </div>
    </div>
  )
}
