import { Pencil, Plus, Shield } from 'lucide-react'
import type { InsuranceInfo } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface InsuranceSectionProps {
  insurance: InsuranceInfo | null
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

export function InsuranceSection({ insurance, onEdit }: InsuranceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance</CardTitle>
        <CardAction>
          <Button variant='ghost' size='sm' onClick={onEdit}>
            {insurance ? <Pencil /> : <Plus />}
            {insurance ? 'Edit' : 'Add'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!insurance ? (
          <div className='flex flex-col items-center justify-center py-6 text-muted-foreground'>
            <Shield className='size-8 mb-2' />
            <p className='text-sm'>Not on file</p>
            <Button variant='ghost' size='sm' className='mt-2' onClick={onEdit}>
              <Plus />
              Add
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-x-6 gap-y-3'>
            <Field label='Provider' value={insurance.provider_name} />
            <Field label='Policy Number' value={insurance.policy_number} />
            <Field label='Group Number' value={insurance.group_number} />
            <Field label='Holder Name' value={insurance.holder_name} />
            <Field label='Holder Relationship' value={insurance.holder_relationship} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
