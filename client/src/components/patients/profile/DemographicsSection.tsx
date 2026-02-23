import { Pencil } from 'lucide-react'
import type { PatientDetail } from '@/lib/types'
import { formatDate, formatPhone } from '@/lib/format'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DemographicsSectionProps {
  patient: PatientDetail
  onEdit: () => void
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='text-sm'>{value || '--'}</p>
    </div>
  )
}

export function DemographicsSection({ patient, onEdit }: DemographicsSectionProps) {
  const fullName = [patient.first_name, patient.middle_name, patient.last_name]
    .filter(Boolean)
    .join(' ')

  const address = `${patient.street}, ${patient.city}, ${patient.state} ${patient.zip_code}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demographics</CardTitle>
        <CardAction>
          <Button variant='ghost' size='sm' onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-x-6 gap-y-3'>
          <Field label='Full Name' value={fullName} />
          <Field label='Date of Birth' value={formatDate(patient.date_of_birth)} />
          <Field label='Sex' value={patient.sex} />
          <Field label='Language' value={patient.primary_language} />
          <Field label='Email' value={patient.email} />
          <Field label='Phone' value={formatPhone(patient.phone)} />
          <Field label='Address' value={address} />
          <Field label='Notes' value={patient.notes} />
        </div>
      </CardContent>
    </Card>
  )
}
