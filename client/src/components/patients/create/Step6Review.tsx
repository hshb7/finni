import type { UseFormReturn } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import type { CreatePatientValues } from '@/lib/schemas'
import { US_STATES } from '@/lib/constants'
import { Button } from '@/components/ui/button'

interface Step6ReviewProps {
  form: UseFormReturn<CreatePatientValues>
  skippedSteps: Set<number>
  onEditStep: (step: number) => void
}

function SectionHeader({ title, step, onEdit }: { title: string; step: number; onEdit: (s: number) => void }) {
  return (
    <div className='flex items-center justify-between'>
      <h3 className='text-sm font-semibold'>{title}</h3>
      <Button type='button' variant='ghost' size='sm' onClick={() => onEdit(step)}>
        <Pencil className='mr-1 size-3' />
        Edit
      </Button>
    </div>
  )
}

function ReviewField({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div>
      <dt className='text-muted-foreground text-xs'>{label}</dt>
      <dd className='text-sm'>{value || '--'}</dd>
    </div>
  )
}

function SkippedSection({ label }: { label: string }) {
  return (
    <p className='text-muted-foreground text-sm italic'>
      {label} not provided — can be added later.
    </p>
  )
}

function getStateName(abbreviation: string | undefined): string {
  if (!abbreviation) return '--'
  const found = US_STATES.find((s) => s.abbreviation === abbreviation)
  return found ? `${found.name} (${abbreviation})` : abbreviation
}

export function Step6Review({ form, skippedSteps, onEditStep }: Step6ReviewProps) {
  const values = form.getValues()

  return (
    <div className='space-y-6'>
      {/* Basic Info */}
      <div className='space-y-3'>
        <SectionHeader title='Basic Information' step={0} onEdit={onEditStep} />
        <dl className='grid grid-cols-2 gap-x-4 gap-y-2'>
          <ReviewField label='First Name' value={values.first_name} />
          <ReviewField label='Middle Name' value={values.middle_name} />
          <ReviewField label='Last Name' value={values.last_name} />
          <ReviewField label='Date of Birth' value={values.date_of_birth} />
          <ReviewField label='Sex' value={values.sex} />
          <ReviewField label='Primary Language' value={values.primary_language} />
        </dl>
      </div>

      <hr />

      {/* Contact & Address */}
      <div className='space-y-3'>
        <SectionHeader title='Contact & Address' step={1} onEdit={onEditStep} />
        <dl className='grid grid-cols-2 gap-x-4 gap-y-2'>
          <ReviewField label='Email' value={values.email} />
          <ReviewField label='Phone' value={values.phone} />
          <ReviewField label='Street' value={values.street} />
          <ReviewField label='City' value={values.city} />
          <ReviewField label='State' value={getStateName(values.state)} />
          <ReviewField label='ZIP Code' value={values.zip_code} />
        </dl>
      </div>

      <hr />

      {/* Emergency Contacts */}
      <div className='space-y-3'>
        <SectionHeader title='Emergency Contacts' step={2} onEdit={onEditStep} />
        {skippedSteps.has(2) || !values.emergency_contacts?.length ? (
          <SkippedSection label='Emergency contacts' />
        ) : (
          <div className='space-y-3'>
            {values.emergency_contacts.map((contact, i) => (
              <div key={i} className='rounded-lg border p-3'>
                <dl className='grid grid-cols-2 gap-x-4 gap-y-1'>
                  <ReviewField label='Name' value={contact.name} />
                  <ReviewField label='Relationship' value={contact.relationship} />
                  <ReviewField label='Phone' value={contact.phone} />
                  <ReviewField label='Email' value={contact.email} />
                </dl>
                {contact.is_primary && (
                  <span className='text-primary mt-1 inline-block text-xs font-medium'>Primary contact</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <hr />

      {/* Insurance */}
      <div className='space-y-3'>
        <SectionHeader title='Insurance' step={3} onEdit={onEditStep} />
        {skippedSteps.has(3) || !values.insurance?.provider_name ? (
          <SkippedSection label='Insurance information' />
        ) : (
          <dl className='grid grid-cols-2 gap-x-4 gap-y-2'>
            <ReviewField label='Provider' value={values.insurance.provider_name} />
            <ReviewField label='Policy Number' value={values.insurance.policy_number} />
            <ReviewField label='Group Number' value={values.insurance.group_number} />
            <ReviewField label='Holder Name' value={values.insurance.holder_name} />
            <ReviewField label='Holder Relationship' value={values.insurance.holder_relationship} />
          </dl>
        )}
      </div>

      <hr />

      {/* Medical */}
      <div className='space-y-3'>
        <SectionHeader title='Medical Information' step={4} onEdit={onEditStep} />
        {skippedSteps.has(4) || !(values.medical?.primary_diagnosis || values.medical?.allergies || values.medical?.current_medications || values.medical?.additional_conditions) ? (
          <SkippedSection label='Medical information' />
        ) : (
          <dl className='grid grid-cols-2 gap-x-4 gap-y-2'>
            <ReviewField label='Primary Diagnosis' value={values.medical.primary_diagnosis} />
            <ReviewField label='Allergies' value={values.medical.allergies} />
            <ReviewField label='Current Medications' value={values.medical.current_medications} />
            <ReviewField label='Additional Conditions' value={values.medical.additional_conditions} />
          </dl>
        )}
      </div>
    </div>
  )
}
