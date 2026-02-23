import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { patientKeys, statsKeys } from '@/lib/query-keys'
import * as api from '@/lib/api'
import type {
  PatientListParams,
  CreatePatientRequest,
  EditDemographicsRequest,
  EditStatusRequest,
  EditContactsRequest,
  InsuranceInput,
  MedicalInput,
  PharmacyInput,
} from '@/lib/types'

export function usePatients(params: PatientListParams = {}) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => api.getPatients(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: patientKeys.detail(id!),
    queryFn: () => api.getPatient(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePatientRequest) => api.createPatient(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.lists() })
      qc.invalidateQueries({ queryKey: statsKeys.all })
    },
  })
}

export function useEditDemographics() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditDemographicsRequest }) =>
      api.editDemographics(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: patientKeys.detail(id) })
      qc.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}

export function useEditStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditStatusRequest }) =>
      api.editStatus(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: patientKeys.detail(id) })
      qc.invalidateQueries({ queryKey: patientKeys.lists() })
      qc.invalidateQueries({ queryKey: statsKeys.all })
    },
  })
}

export function useEditContacts() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditContactsRequest }) =>
      api.editContacts(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: patientKeys.detail(id) })
    },
  })
}

export function useEditInsurance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsuranceInput }) =>
      api.editInsurance(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: patientKeys.detail(id) })
    },
  })
}

export function useEditMedical() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MedicalInput }) =>
      api.editMedical(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: patientKeys.detail(id) })
    },
  })
}

export function useEditPharmacy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PharmacyInput }) =>
      api.editPharmacy(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: patientKeys.detail(id) })
    },
  })
}
