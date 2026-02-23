import type { PatientListParams, PharmacySearchParams } from './types'

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (params: PatientListParams) => [...patientKeys.lists(), params] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
}

export const appointmentKeys = {
  all: ['appointments'] as const,
  byPatient: (patientId: string) => [...appointmentKeys.all, patientId] as const,
}

export const visitKeys = {
  all: ['visits'] as const,
  byPatient: (patientId: string) => [...visitKeys.all, patientId] as const,
}

export const immunizationKeys = {
  all: ['immunizations'] as const,
  byPatient: (patientId: string) => [...immunizationKeys.all, patientId] as const,
}

export const prescriptionKeys = {
  all: ['prescriptions'] as const,
  byPatient: (patientId: string) => [...prescriptionKeys.all, patientId] as const,
}

export const medicationKeys = {
  all: ['medications'] as const,
}

export const pharmacyKeys = {
  all: ['pharmacies'] as const,
  search: (params: PharmacySearchParams) => [...pharmacyKeys.all, 'search', params] as const,
}

export const statsKeys = {
  all: ['stats'] as const,
  overview: () => [...statsKeys.all, 'overview'] as const,
  trends: () => [...statsKeys.all, 'trends'] as const,
  recentAppointments: (month?: string) => [...statsKeys.all, 'recentAppointments', month] as const,
  careGaps: () => [...statsKeys.all, 'careGaps'] as const,
  newPatientsTrend: () => [...statsKeys.all, 'newPatientsTrend'] as const,
  topMedications: () => [...statsKeys.all, 'topMedications'] as const,
  recentActivity: () => [...statsKeys.all, 'recentActivity'] as const,
}
