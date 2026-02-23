import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { visitKeys, patientKeys } from '@/lib/query-keys'
import * as api from '@/lib/api'
import type { CreateVisitRequest, EditVisitRequest } from '@/lib/types'

export function useVisits(patientId: string | undefined) {
  return useQuery({
    queryKey: visitKeys.byPatient(patientId!),
    queryFn: () => api.getVisits(patientId!),
    enabled: !!patientId,
  })
}

export function useCreateVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CreateVisitRequest }) =>
      api.createVisit(patientId, data),
    onSuccess: (_data, { patientId }) => {
      qc.invalidateQueries({ queryKey: visitKeys.byPatient(patientId) })
      qc.invalidateQueries({ queryKey: patientKeys.detail(patientId) })
    },
  })
}

export function useEditVisit(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditVisitRequest }) =>
      api.editVisit(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: visitKeys.byPatient(patientId) })
      qc.invalidateQueries({ queryKey: patientKeys.detail(patientId) })
    },
  })
}
