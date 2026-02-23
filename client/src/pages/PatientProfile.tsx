import { useParams } from 'react-router'
import { usePatient } from '@/hooks/use-patients'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PatientHeader } from '@/components/patients/profile/PatientHeader'
import { PatientSkeleton } from '@/components/patients/profile/PatientSkeleton'
import { PatientNotFound } from '@/components/patients/profile/PatientNotFound'
import { OverviewTab } from '@/components/patients/profile/OverviewTab'
import { AppointmentsTab } from '@/components/patients/profile/AppointmentsTab'
import { ClinicalTab } from '@/components/patients/profile/ClinicalTab'
import { PrescriptionsStatusTab } from '@/components/patients/profile/PrescriptionsStatusTab'

export default function PatientProfile() {
  const { id } = useParams()
  const { data: patient, isLoading, isError } = usePatient(id)

  if (isLoading) return <PatientSkeleton />
  if (isError || !patient) return <PatientNotFound />

  return (
    <div className='space-y-6'>
      <PatientHeader patient={patient} />

      <Tabs defaultValue='overview'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='appointments'>Appointments</TabsTrigger>
          <TabsTrigger value='clinical'>Clinical</TabsTrigger>
          <TabsTrigger value='prescriptions'>Prescriptions & Status</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <OverviewTab patient={patient} />
        </TabsContent>

        <TabsContent value='appointments'>
          <AppointmentsTab patient={patient} />
        </TabsContent>

        <TabsContent value='clinical'>
          <ClinicalTab patient={patient} />
        </TabsContent>

        <TabsContent value='prescriptions'>
          <PrescriptionsStatusTab patient={patient} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
