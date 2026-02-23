import { Pencil, Plus, Users } from 'lucide-react'
import type { EmergencyContact } from '@/lib/types'
import { formatPhone } from '@/lib/format'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ContactsSectionProps {
  contacts: EmergencyContact[]
  onEdit: () => void
}

export function ContactsSection({ contacts, onEdit }: ContactsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Contacts</CardTitle>
        <CardAction>
          <Button variant='ghost' size='sm' onClick={onEdit}>
            {contacts.length > 0 ? <Pencil /> : <Plus />}
            {contacts.length > 0 ? 'Edit' : 'Add'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-6 text-muted-foreground'>
            <Users className='size-8 mb-2' />
            <p className='text-sm'>Not on file</p>
            <Button variant='ghost' size='sm' className='mt-2' onClick={onEdit}>
              <Plus />
              Add
            </Button>
          </div>
        ) : (
          <div className='space-y-0'>
            {contacts.map((contact, index) => (
              <div
                key={contact.id}
                className={`py-3 ${index < contacts.length - 1 ? 'border-b' : ''}`}
              >
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-medium'>{contact.name}</p>
                  {contact.is_primary && (
                    <span className='flex items-center gap-1 text-xs text-status-active'>
                      <span className='size-2 rounded-full bg-status-active' />
                      Primary
                    </span>
                  )}
                </div>
                <p className='text-sm text-muted-foreground'>{contact.relationship}</p>
                <p className='text-sm'>{formatPhone(contact.phone)}</p>
                {contact.email && <p className='text-sm'>{contact.email}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
