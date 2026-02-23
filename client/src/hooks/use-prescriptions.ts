import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { prescriptionKeys, medicationKeys, patientKeys } from '@/lib/query-keys'
import * as api from '@/lib/api'
import type { CreatePrescriptionRequest } from '@/lib/types'

export function useMedications() {
  return useQuery({
    queryKey: medicationKeys.all,
    queryFn: api.getMedications,
    staleTime: Infinity,
  })
}

export function usePrescriptions(patientId: string | undefined) {
  return useQuery({
    queryKey: prescriptionKeys.byPatient(patientId!),
    queryFn: () => api.getPrescriptions(patientId!),
    enabled: !!patientId,
  })
}

export function useCreatePrescription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CreatePrescriptionRequest }) =>
      api.createPrescription(patientId, data),
    onSuccess: (_data, { patientId }) => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.byPatient(patientId) })
      qc.invalidateQueries({ queryKey: patientKeys.detail(patientId) })
    },
  })
}
