import { Pencil, Plus, MapPin } from 'lucide-react'
import type { PreferredPharmacy } from '@/lib/types'
import { formatPhone } from '@/lib/format'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PharmacySectionProps {
  pharmacy: PreferredPharmacy | null
  onEdit: () => void
}

export function PharmacySection({ pharmacy, onEdit }: PharmacySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferred Pharmacy</CardTitle>
        <CardAction>
          <Button variant='ghost' size='sm' onClick={onEdit}>
            {pharmacy ? <Pencil /> : <Plus />}
            {pharmacy ? 'Edit' : 'Add'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!pharmacy ? (
          <div className='flex flex-col items-center justify-center py-6 text-muted-foreground'>
            <MapPin className='size-8 mb-2' />
            <p className='text-sm'>Not on file</p>
            <Button variant='ghost' size='sm' className='mt-2' onClick={onEdit}>
              <Plus />
              Add
            </Button>
          </div>
        ) : (
          <div className='space-y-3'>
            <div>
              <p className='text-sm text-muted-foreground'>Name</p>
              <p className='text-sm'>{pharmacy.name}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Address</p>
              <p className='text-sm'>{pharmacy.address}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Phone</p>
              <p className='text-sm'>{formatPhone(pharmacy.phone)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
