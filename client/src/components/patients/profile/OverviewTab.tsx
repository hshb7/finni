import { useState } from 'react'
import type { PatientDetail } from '@/lib/types'
import { DemographicsSection } from './DemographicsSection'
import { ContactsSection } from './ContactsSection'
import { InsuranceSection } from './InsuranceSection'
import { MedicalSection } from './MedicalSection'
import { PharmacySection } from './PharmacySection'
import { EditDemographicsDialog } from './EditDemographicsDialog'
import { EditContactsDialog } from './EditContactsDialog'
import { EditInsuranceDialog } from './EditInsuranceDialog'
import { EditMedicalDialog } from './EditMedicalDialog'
import { EditPharmacyDialog } from './EditPharmacyDialog'

interface OverviewTabProps {
  patient: PatientDetail
}

export function OverviewTab({ patient }: OverviewTabProps) {
  const [editDemo, setEditDemo] = useState(false)
  const [editContacts, setEditContacts] = useState(false)
  const [editInsurance, setEditInsurance] = useState(false)
  const [editMedical, setEditMedical] = useState(false)
  const [editPharmacy, setEditPharmacy] = useState(false)

  return (
    <>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div className='space-y-6'>
          <DemographicsSection patient={patient} onEdit={() => setEditDemo(true)} />
          <ContactsSection contacts={patient.emergency_contacts} onEdit={() => setEditContacts(true)} />
        </div>
        <div className='space-y-6'>
          <InsuranceSection insurance={patient.insurance_info} onEdit={() => setEditInsurance(true)} />
          <MedicalSection medical={patient.medical_info} onEdit={() => setEditMedical(true)} />
          <PharmacySection pharmacy={patient.preferred_pharmacy} onEdit={() => setEditPharmacy(true)} />
        </div>
      </div>

      <EditDemographicsDialog
        open={editDemo}
        onOpenChange={setEditDemo}
        patient={patient}
        patientId={patient.id}
      />
      <EditContactsDialog
        open={editContacts}
        onOpenChange={setEditContacts}
        contacts={patient.emergency_contacts}
        patientId={patient.id}
      />
      <EditInsuranceDialog
        open={editInsurance}
        onOpenChange={setEditInsurance}
        insurance={patient.insurance_info}
        patientId={patient.id}
      />
      <EditMedicalDialog
        open={editMedical}
        onOpenChange={setEditMedical}
        medical={patient.medical_info}
        patientId={patient.id}
      />
      <EditPharmacyDialog
        open={editPharmacy}
        onOpenChange={setEditPharmacy}
        pharmacy={patient.preferred_pharmacy}
        patientId={patient.id}
      />
    </>
  )
}
