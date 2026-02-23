import type { UseFormReturn } from 'react-hook-form'
import type { CreatePatientValues } from '@/lib/schemas'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

interface Step5MedicalProps {
  form: UseFormReturn<CreatePatientValues>
}

export function Step5Medical({ form }: Step5MedicalProps) {
  return (
    <div className='space-y-4'>
      <p className='text-muted-foreground text-sm'>
        Medical information is optional. You can skip this step and add it later from the patient profile.
      </p>
      <FormField
        control={form.control}
        name='medical.primary_diagnosis'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Diagnosis</FormLabel>
            <FormControl>
              <Textarea
                placeholder='Enter primary diagnosis...'
                className='resize-none'
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='medical.allergies'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Allergies</FormLabel>
            <FormControl>
              <Textarea
                placeholder='List known allergies...'
                className='resize-none'
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='medical.current_medications'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Medications</FormLabel>
            <FormControl>
              <Textarea
                placeholder='List current medications...'
                className='resize-none'
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='medical.additional_conditions'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Conditions</FormLabel>
            <FormControl>
              <Textarea
                placeholder='Any other medical conditions...'
                className='resize-none'
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
