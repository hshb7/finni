import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { immunizationKeys, patientKeys } from '@/lib/query-keys'
import * as api from '@/lib/api'
import type { CreateImmunizationRequest, EditImmunizationRequest } from '@/lib/types'

export function useImmunizations(patientId: string | undefined) {
  return useQuery({
    queryKey: immunizationKeys.byPatient(patientId!),
    queryFn: () => api.getImmunizations(patientId!),
    enabled: !!patientId,
  })
}

export function useCreateImmunization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CreateImmunizationRequest }) =>
      api.createImmunization(patientId, data),
    onSuccess: (_data, { patientId }) => {
      qc.invalidateQueries({ queryKey: immunizationKeys.byPatient(patientId) })
      qc.invalidateQueries({ queryKey: patientKeys.detail(patientId) })
    },
  })
}

export function useEditImmunization(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditImmunizationRequest }) =>
      api.editImmunization(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: immunizationKeys.byPatient(patientId) })
      qc.invalidateQueries({ queryKey: patientKeys.detail(patientId) })
    },
  })
}
