import type {
  PaginatedPatients,
  PatientDetail,
  Patient,
  PatientListParams,
  CreatePatientRequest,
  EditDemographicsRequest,
  EditStatusRequest,
  EditContactsRequest,
  InsuranceInput,
  MedicalInput,
  PharmacyInput,
  Appointment,
  CreateAppointmentRequest,
  EditAppointmentRequest,
  Visit,
  CreateVisitRequest,
  EditVisitRequest,
  Immunization,
  CreateImmunizationRequest,
  EditImmunizationRequest,
  Medication,
  Prescription,
  CreatePrescriptionRequest,
  PharmacySearchParams,
  PharmacySearchResponse,
  StatsOverview,
  StatsTrends,
  RecentAppointments,
  CareGaps,
  NewPatientsTrend,
  TopMedications,
  RecentActivity,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, body.detail || res.statusText)
  }

  return res.json() as Promise<T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toQueryString(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  )
  if (entries.length === 0) return ''
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

// ======================== Patients ========================

export function getPatients(params: PatientListParams = {}): Promise<PaginatedPatients> {
  return apiFetch(`/getPatients${toQueryString(params)}`)
}

export function getPatient(id: string): Promise<PatientDetail> {
  return apiFetch(`/getPatient/${id}`)
}

export function createPatient(data: CreatePatientRequest): Promise<Patient> {
  return apiFetch('/createPatient', { method: 'POST', body: JSON.stringify(data) })
}

export function editDemographics(id: string, data: EditDemographicsRequest): Promise<Patient> {
  return apiFetch(`/editDemographics/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function editStatus(id: string, data: EditStatusRequest): Promise<Patient> {
  return apiFetch(`/editStatus/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function editContacts(id: string, data: EditContactsRequest): Promise<Patient> {
  return apiFetch(`/editContacts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function editInsurance(id: string, data: InsuranceInput): Promise<Patient> {
  return apiFetch(`/editInsurance/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function editMedical(id: string, data: MedicalInput): Promise<Patient> {
  return apiFetch(`/editMedical/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function editPharmacy(id: string, data: PharmacyInput): Promise<Patient> {
  return apiFetch(`/editPharmacy/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

// ======================== Appointments ========================

export function getAppointments(patientId: string): Promise<Appointment[]> {
  return apiFetch(`/getAppointments/${patientId}`)
}

export function createAppointment(patientId: string, data: CreateAppointmentRequest): Promise<Appointment> {
  return apiFetch(`/createAppointment/${patientId}`, { method: 'POST', body: JSON.stringify(data) })
}

export function editAppointment(id: string, data: EditAppointmentRequest): Promise<Appointment> {
  return apiFetch(`/editAppointment/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

// ======================== Visits ========================

export function getVisits(patientId: string): Promise<Visit[]> {
  return apiFetch(`/getVisits/${patientId}`)
}

export function createVisit(patientId: string, data: CreateVisitRequest): Promise<Visit> {
  return apiFetch(`/createVisit/${patientId}`, { method: 'POST', body: JSON.stringify(data) })
}

export function editVisit(id: string, data: EditVisitRequest): Promise<Visit> {
  return apiFetch(`/editVisit/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

// ======================== Immunizations ========================

export function getImmunizations(patientId: string): Promise<Immunization[]> {
  return apiFetch(`/getImmunizations/${patientId}`)
}

export function createImmunization(patientId: string, data: CreateImmunizationRequest): Promise<Immunization> {
  return apiFetch(`/createImmunization/${patientId}`, { method: 'POST', body: JSON.stringify(data) })
}

export function editImmunization(id: string, data: EditImmunizationRequest): Promise<Immunization> {
  return apiFetch(`/editImmunization/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

// ======================== Prescriptions & Medications ========================

export function getMedications(): Promise<Medication[]> {
  return apiFetch('/getMedications')
}

export function getPrescriptions(patientId: string): Promise<Prescription[]> {
  return apiFetch(`/getPrescriptions/${patientId}`)
}

export function createPrescription(patientId: string, data: CreatePrescriptionRequest): Promise<Prescription> {
  return apiFetch(`/createPrescription/${patientId}`, { method: 'POST', body: JSON.stringify(data) })
}

// ======================== Pharmacies ========================

export function getNearbyPharmacies(params: PharmacySearchParams): Promise<PharmacySearchResponse> {
  return apiFetch(`/getNearbyPharmacies${toQueryString(params)}`)
}

// ======================== Stats ========================

export function getStatsOverview(): Promise<StatsOverview> {
  return apiFetch('/getStatsOverview')
}

export function getStatsTrends(): Promise<StatsTrends> {
  return apiFetch('/getStatsTrends')
}

export function getRecentAppointments(month?: string): Promise<RecentAppointments> {
  const params = month ? `?month=${month}` : ''
  return apiFetch(`/getRecentAppointments${params}`)
}

export function getCareGaps(): Promise<CareGaps> {
  return apiFetch('/getCareGaps')
}

export function getNewPatientsTrend(): Promise<NewPatientsTrend> {
  return apiFetch('/getNewPatientsTrend')
}

export function getTopMedications(): Promise<TopMedications> {
  return apiFetch('/getTopMedications')
}

export function getRecentActivity(): Promise<RecentActivity> {
  return apiFetch('/getRecentActivity')
}
