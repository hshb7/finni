import { Pencil, Plus, Stethoscope } from 'lucide-react'
import type { MedicalInfo } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MedicalSectionProps {
  medical: MedicalInfo | null
  onEdit: () => void
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='text-sm whitespace-pre-wrap'>{value || '--'}</p>
    </div>
  )
}

export function MedicalSection({ medical, onEdit }: MedicalSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Information</CardTitle>
        <CardAction>
          <Button variant='ghost' size='sm' onClick={onEdit}>
            {medical ? <Pencil /> : <Plus />}
            {medical ? 'Edit' : 'Add'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!medical ? (
          <div className='flex flex-col items-center justify-center py-6 text-muted-foreground'>
            <Stethoscope className='size-8 mb-2' />
            <p className='text-sm'>Not on file</p>
            <Button variant='ghost' size='sm' className='mt-2' onClick={onEdit}>
              <Plus />
              Add
            </Button>
          </div>
        ) : (
          <div className='space-y-3'>
            <Field label='Primary Diagnosis' value={medical.primary_diagnosis} />
            <Field label='Allergies' value={medical.allergies} />
            <Field label='Current Medications' value={medical.current_medications} />
            <Field label='Additional Conditions' value={medical.additional_conditions} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
