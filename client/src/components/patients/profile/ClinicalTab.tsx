import { useState } from 'react'
import { ClipboardPlus, Syringe } from 'lucide-react'
import type { Visit, Immunization, PatientDetail } from '@/lib/types'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
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
import { VisitFormDialog } from './VisitFormDialog'
import { ImmunizationFormDialog } from './ImmunizationFormDialog'

interface ClinicalTabProps {
  patient: PatientDetail
}

export function ClinicalTab({ patient }: ClinicalTabProps) {
  const [createVisitOpen, setCreateVisitOpen] = useState(false)
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [createImmOpen, setCreateImmOpen] = useState(false)
  const [editingImm, setEditingImm] = useState<Immunization | null>(null)

  const visits = patient.visits
  const immunizations = patient.immunizations

  return (
    <div className='space-y-6'>
      {/* Visits */}
      <Card>
        <CardHeader>
          <CardTitle>Visits</CardTitle>
          <CardAction>
            <Button variant='outline' size='sm' onClick={() => setCreateVisitOpen(true)}>
              <ClipboardPlus className='size-4' />
              Add Visit
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <ClipboardPlus className='text-muted-foreground mb-2 size-10' />
              <p className='text-muted-foreground text-sm'>No visits recorded</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead className='w-[60px]' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{formatDate(visit.visit_date)}</TableCell>
                    <TableCell>{visit.visit_type}</TableCell>
                    <TableCell>{visit.provider_name}</TableCell>
                    <TableCell className='max-w-[200px] truncate'>{visit.diagnosis || '--'}</TableCell>
                    <TableCell>
                      <span className={cn(
                        'text-sm',
                        visit.follow_up_needed ? 'text-status-onboarding' : 'text-muted-foreground'
                      )}>
                        {visit.follow_up_needed ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant='ghost' size='xs' onClick={() => setEditingVisit(visit)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Immunizations */}
      <Card>
        <CardHeader>
          <CardTitle>Immunizations</CardTitle>
          <CardAction>
            <Button variant='outline' size='sm' onClick={() => setCreateImmOpen(true)}>
              <Syringe className='size-4' />
              Add Immunization
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {immunizations.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <Syringe className='text-muted-foreground mb-2 size-10' />
              <p className='text-muted-foreground text-sm'>No immunizations recorded</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vaccine</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Administered By</TableHead>
                  <TableHead>Dose #</TableHead>
                  <TableHead>Lot #</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead className='w-[60px]' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {immunizations.map((imm) => (
                  <TableRow key={imm.id}>
                    <TableCell>{imm.vaccine_name}</TableCell>
                    <TableCell>{formatDate(imm.date_administered)}</TableCell>
                    <TableCell>{imm.administered_by || '--'}</TableCell>
                    <TableCell>{imm.dose_number ?? '--'}</TableCell>
                    <TableCell>{imm.lot_number || '--'}</TableCell>
                    <TableCell>{imm.next_due_date ? formatDate(imm.next_due_date) : '--'}</TableCell>
                    <TableCell>
                      <Button variant='ghost' size='xs' onClick={() => setEditingImm(imm)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <VisitFormDialog
        open={createVisitOpen}
        onOpenChange={setCreateVisitOpen}
        patientId={patient.id}
        editingItem={null}
      />
      <VisitFormDialog
        open={editingVisit !== null}
        onOpenChange={(open) => { if (!open) setEditingVisit(null) }}
        patientId={patient.id}
        editingItem={editingVisit}
      />
      <ImmunizationFormDialog
        open={createImmOpen}
        onOpenChange={setCreateImmOpen}
        patientId={patient.id}
        editingItem={null}
      />
      <ImmunizationFormDialog
        open={editingImm !== null}
        onOpenChange={(open) => { if (!open) setEditingImm(null) }}
        patientId={patient.id}
        editingItem={editingImm}
      />
    </div>
  )
}
