import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentKeys, patientKeys } from '@/lib/query-keys'
import * as api from '@/lib/api'
import type { CreateAppointmentRequest, EditAppointmentRequest } from '@/lib/types'

export function useAppointments(patientId: string | undefined) {
  return useQuery({
    queryKey: appointmentKeys.byPatient(patientId!),
    queryFn: () => api.getAppointments(patientId!),
    enabled: !!patientId,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CreateAppointmentRequest }) =>
      api.createAppointment(patientId, data),
    onSuccess: (_data, { patientId }) => {
      qc.invalidateQueries({ queryKey: appointmentKeys.byPatient(patientId) })
      qc.invalidateQueries({ queryKey: patientKeys.detail(patientId) })
    },
  })
}

export function useEditAppointment(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditAppointmentRequest }) =>
      api.editAppointment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.byPatient(patientId) })
      qc.invalidateQueries({ queryKey: patientKeys.detail(patientId) })
    },
  })
}
