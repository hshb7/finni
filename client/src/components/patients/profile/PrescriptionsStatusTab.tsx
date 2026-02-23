import { useState } from 'react'
import { Link } from 'react-router'
import { Pencil, Pill } from 'lucide-react'
import type { PatientDetail } from '@/lib/types'
import { formatDate } from '@/lib/format'
import { StatusBadge } from '@/components/patients/StatusBadge'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { StatusTimeline } from './StatusTimeline'
import { EditStatusDialog } from './EditStatusDialog'

interface PrescriptionsStatusTabProps {
  patient: PatientDetail
}

export function PrescriptionsStatusTab({ patient }: PrescriptionsStatusTabProps) {
  const [editStatusOpen, setEditStatusOpen] = useState(false)

  const prescriptions = patient.prescriptions

  return (
    <div className='space-y-6'>
      {/* Prescriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
          <CardAction>
            <Button variant='outline' size='sm' asChild>
              <Link to={`/patients/${patient.id}/prescribe`}>
                <Pill className='size-4' />
                New Prescription
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <Pill className='text-muted-foreground mb-2 size-10' />
              <p className='text-muted-foreground text-sm'>No prescriptions yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Pharmacy</TableHead>
                  <TableHead>Prescribed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((rx) => (
                  <TableRow key={rx.id}>
                    <TableCell className='font-medium'>
                      {rx.medication?.name ?? 'Unknown'}
                    </TableCell>
                    <TableCell>{rx.dosage}</TableCell>
                    <TableCell>{rx.frequency}</TableCell>
                    <TableCell>{rx.quantity}</TableCell>
                    <TableCell>{rx.pharmacy_name}</TableCell>
                    <TableCell>{formatDate(rx.prescribed_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardAction>
              <Button variant='ghost' size='sm' onClick={() => setEditStatusOpen(true)}>
                <Pencil className='size-4' />
                Edit
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div>
                <p className='text-muted-foreground text-sm'>Status</p>
                <StatusBadge status={patient.status} className='mt-1' />
              </div>
              {patient.referral_source && (
                <div>
                  <p className='text-muted-foreground text-sm'>Referral Source</p>
                  <p className='text-sm'>{patient.referral_source}</p>
                </div>
              )}
              {patient.notes && (
                <div>
                  <p className='text-muted-foreground text-sm'>Notes</p>
                  <p className='whitespace-pre-wrap text-sm'>{patient.notes}</p>
                </div>
              )}
              <div>
                <p className='text-muted-foreground text-sm'>Patient Since</p>
                <p className='text-sm'>{formatDate(patient.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <StatusTimeline history={patient.status_history} />
      </div>

      <EditStatusDialog
        open={editStatusOpen}
        onOpenChange={setEditStatusOpen}
        currentStatus={patient.status}
        patientId={patient.id}
      />
    </div>
  )
}
