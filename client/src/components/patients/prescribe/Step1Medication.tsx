import { useState, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Pill, RefreshCw } from 'lucide-react'
import type { PrescriptionValues } from '@/lib/schemas'
import type { Medication } from '@/lib/types'
import { FREQUENCY_OPTIONS } from '@/lib/constants'
import { useMedications } from '@/hooks/use-prescriptions'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Step1MedicationProps {
  form: UseFormReturn<PrescriptionValues>
}

export function Step1Medication({ form }: Step1MedicationProps) {
  const { data: medications, isLoading } = useMedications()
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)

  const dosageOptions = useMemo(() => {
    if (!selectedMedication) return []
    return selectedMedication.common_dosages.split(', ').map((d) => d.trim()).filter(Boolean)
  }, [selectedMedication])

  const grouped = useMemo(() => {
    if (!medications) return new Map<string, Medication[]>()
    const map = new Map<string, Medication[]>()
    for (const med of medications) {
      const list = map.get(med.category) ?? []
      list.push(med)
      map.set(med.category, list)
    }
    return map
  }, [medications])

  const handleSelectMedication = (med: Medication) => {
    setSelectedMedication(med)
    form.setValue('medication_id', med.id)
    form.setValue('dosage', '')
    form.clearErrors('medication_id')
  }

  const handleChange = () => {
    setSelectedMedication(null)
    form.setValue('medication_id', '')
    form.setValue('dosage', '')
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-32 w-full' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Medication Search */}
      <div>
        <label className='text-sm font-medium'>Medication</label>
        {selectedMedication ? (
          <div className='mt-2 flex items-center justify-between rounded-lg border p-3'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-full bg-primary/10'>
                <Pill className='size-4 text-primary' />
              </div>
              <div>
                <p className='text-sm font-medium'>{selectedMedication.name}</p>
                <p className='text-muted-foreground text-xs'>
                  {selectedMedication.generic_name && `${selectedMedication.generic_name} · `}
                  {selectedMedication.form} · {selectedMedication.category}
                </p>
              </div>
            </div>
            <Button type='button' variant='ghost' size='sm' onClick={handleChange}>
              <RefreshCw className='mr-1 size-3' />
              Change
            </Button>
          </div>
        ) : (
          <div className='mt-2 rounded-lg border'>
            <Command className='rounded-lg'>
              <CommandInput placeholder='Search medications...' />
              <CommandList>
                <CommandEmpty>No medications found.</CommandEmpty>
                {Array.from(grouped.entries()).map(([category, meds]) => (
                  <CommandGroup key={category} heading={category}>
                    {meds.map((med) => (
                      <CommandItem
                        key={med.id}
                        value={`${med.name} ${med.generic_name ?? ''}`}
                        onSelect={() => handleSelectMedication(med)}
                      >
                        <div>
                          <span className='font-medium'>{med.name}</span>
                          {med.generic_name && (
                            <span className='text-muted-foreground ml-2 text-xs'>
                              {med.generic_name}
                            </span>
                          )}
                          <span className='text-muted-foreground ml-2 text-xs'>
                            ({med.form})
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </div>
        )}
        {form.formState.errors.medication_id && (
          <p className='text-destructive mt-1 text-sm'>
            {form.formState.errors.medication_id.message}
          </p>
        )}
      </div>

      {/* Dosage Details (shown after medication selected) */}
      {selectedMedication && (
        <div className='space-y-4'>
          <h3 className='text-sm font-semibold'>Dosage Details</h3>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='dosage'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select dosage' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dosageOptions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
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
              name='frequency'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select frequency' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
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
              name='quantity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type='number' min={1} placeholder='30' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='duration'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. 30 days' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Additional instructions or notes...'
                    className='resize-none'
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}
