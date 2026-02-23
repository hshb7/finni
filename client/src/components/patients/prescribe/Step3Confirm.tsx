import type { UseFormReturn } from 'react-hook-form'
import type { PrescriptionValues } from '@/lib/schemas'
import { useMedications } from '@/hooks/use-prescriptions'

interface Step3ConfirmProps {
  form: UseFormReturn<PrescriptionValues>
  patientName: string
}

function ReviewField({ label, value }: { label: string; value: string | number | undefined | null }) {
  return (
    <div>
      <dt className='text-muted-foreground text-xs'>{label}</dt>
      <dd className='text-sm'>{value || '--'}</dd>
    </div>
  )
}

export function Step3Confirm({ form, patientName }: Step3ConfirmProps) {
  const values = form.getValues()
  const { data: medications } = useMedications()

  const medication = medications?.find((m) => m.id === values.medication_id)

  return (
    <div className='space-y-6'>
      <p className='text-muted-foreground text-sm'>
        Review the prescription details for <span className='font-medium text-foreground'>{patientName}</span>.
      </p>

      {/* Medication Section */}
      <div className='space-y-3'>
        <h3 className='text-sm font-semibold'>Medication</h3>
        <dl className='grid grid-cols-2 gap-x-4 gap-y-2'>
          <ReviewField label='Medication' value={medication?.name} />
          <ReviewField label='Generic Name' value={medication?.generic_name} />
          <ReviewField label='Dosage' value={values.dosage} />
          <ReviewField label='Frequency' value={values.frequency} />
          <ReviewField label='Quantity' value={values.quantity} />
          <ReviewField label='Duration' value={values.duration} />
        </dl>
        {values.notes && (
          <div>
            <dt className='text-muted-foreground text-xs'>Notes</dt>
            <dd className='text-sm'>{values.notes}</dd>
          </div>
        )}
      </div>

      <hr />

      {/* Pharmacy Section */}
      <div className='space-y-3'>
        <h3 className='text-sm font-semibold'>Pharmacy</h3>
        <dl className='grid grid-cols-2 gap-x-4 gap-y-2'>
          <ReviewField label='Pharmacy Name' value={values.pharmacy_name} />
          <ReviewField label='Address' value={values.pharmacy_address} />
        </dl>
        {values.save_as_preferred_pharmacy && (
          <p className='text-primary text-xs font-medium'>
            This pharmacy will be saved as the patient&apos;s preferred pharmacy.
          </p>
        )}
      </div>
    </div>
  )
}
