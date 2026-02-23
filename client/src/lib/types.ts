import type { PatientStatus, Sex, AppointmentType, AppointmentStatus, VisitType, MedicationForm, HolderRelationship, Relationship, SortColumn } from './constants'

// ======================== Response types ========================

export interface Patient {
  id: string
  first_name: string
  middle_name: string | null
  last_name: string
  date_of_birth: string
  sex: Sex
  primary_language: string | null
  email: string | null
  phone: string | null
  street: string
  city: string
  state: string
  zip_code: string
  status: PatientStatus
  referral_source: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface EmergencyContact {
  id: string
  patient_id: string
  name: string
  relationship: Relationship
  phone: string
  email: string | null
  is_primary: boolean
}

export interface InsuranceInfo {
  id: string
  patient_id: string
  provider_name: string
  policy_number: string
  group_number: string | null
  holder_name: string
  holder_relationship: HolderRelationship
}

export interface MedicalInfo {
  id: string
  patient_id: string
  primary_diagnosis: string | null
  allergies: string | null
  current_medications: string | null
  additional_conditions: string | null
}

export interface PreferredPharmacy {
  id: string
  patient_id: string
  name: string
  address: string
  phone: string | null
  lat: number | null
  lng: number | null
}

export interface Appointment {
  id: string
  patient_id: string
  provider_name: string
  appointment_type: AppointmentType
  date_time: string
  duration_minutes: number
  location: string | null
  notes: string | null
  status: AppointmentStatus
  created_at: string
}

export interface Visit {
  id: string
  patient_id: string
  provider_name: string
  visit_type: VisitType
  visit_date: string
  summary: string | null
  diagnosis: string | null
  follow_up_needed: boolean
  created_at: string
}

export interface Immunization {
  id: string
  patient_id: string
  vaccine_name: string
  date_administered: string
  administered_by: string | null
  dose_number: number | null
  lot_number: string | null
  next_due_date: string | null
  notes: string | null
}

export interface Medication {
  id: string
  name: string
  generic_name: string | null
  description: string | null
  common_dosages: string
  form: MedicationForm
  category: string
}

export interface Prescription {
  id: string
  patient_id: string
  medication_id: string
  dosage: string
  frequency: string
  quantity: number
  duration: string | null
  pharmacy_name: string
  pharmacy_address: string
  pharmacy_lat: number
  pharmacy_lng: number
  prescribed_at: string
  notes: string | null
  medication: Medication | null
}

export interface StatusHistoryEntry {
  id: string
  patient_id: string
  old_status: string | null
  new_status: PatientStatus
  changed_at: string
}

export interface PatientDetail extends Patient {
  emergency_contacts: EmergencyContact[]
  insurance_info: InsuranceInfo | null
  medical_info: MedicalInfo | null
  preferred_pharmacy: PreferredPharmacy | null
  appointments: Appointment[]
  visits: Visit[]
  immunizations: Immunization[]
  prescriptions: Prescription[]
  status_history: StatusHistoryEntry[]
}

export interface PatientListItem {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  status: PatientStatus
  city: string
  state: string
  phone: string | null
  created_at: string
}

export interface PaginatedPatients {
  items: PatientListItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ======================== Stats types ========================

export interface StatusCount {
  status: PatientStatus
  count: number
}

export interface StatsOverview {
  status_counts: StatusCount[]
  total_patients: number
}

export interface TrendDataPoint {
  period: string
  inquiry: number
  onboarding: number
  active: number
  churned: number
}

export interface StatsTrends {
  trends: TrendDataPoint[]
}

// ======================== Dashboard widget types ========================

export interface RecentAppointmentItem {
  id: string
  patient_id: string
  patient_name: string
  provider_name: string
  appointment_type: string
  date_time: string
  duration_minutes: number | null
  status: string
}

export interface RecentAppointments {
  upcoming: RecentAppointmentItem[]
  total_scheduled: number
  total_completed: number
  total_cancelled: number
  total_no_show: number
}

export interface CareGapItem {
  patient_id: string
  patient_name: string
  visit_date: string
  diagnosis: string | null
  days_since_visit: number
}

export interface CareGaps {
  items: CareGapItem[]
  total_count: number
}

export interface NewPatientsDataPoint {
  period: string
  count: number
}

export interface NewPatientsTrend {
  trends: NewPatientsDataPoint[]
}

export interface TopMedicationItem {
  medication_name: string
  category: string
  count: number
}

export interface TopMedications {
  items: TopMedicationItem[]
}

// ======================== Activity types ========================

export interface ActivityItem {
  event_type: 'appointment' | 'visit' | 'prescription' | 'status_change' | 'new_patient'
  description: string
  actor_name: string
  patient_name: string
  patient_id: string
  timestamp: string
  detail: string | null
}

export interface RecentActivity {
  items: ActivityItem[]
}

// ======================== Pharmacy types ========================

export interface PharmacyResult {
  name: string
  address: string
  lat: number
  lng: number
  distance: number | null
  rating: number | null
  open_now: boolean | null
}

export interface PharmacySearchResponse {
  results: PharmacyResult[]
}

// ======================== Request types ========================

export interface EmergencyContactInput {
  name: string
  relationship: string
  phone: string
  email?: string
  is_primary?: boolean
}

export interface InsuranceInput {
  provider_name: string
  policy_number: string
  group_number?: string
  holder_name: string
  holder_relationship: string
}

export interface MedicalInput {
  primary_diagnosis?: string
  allergies?: string
  current_medications?: string
  additional_conditions?: string
}

export interface PharmacyInput {
  name: string
  address: string
  phone?: string
  lat?: number
  lng?: number
}

export interface CreatePatientRequest {
  first_name: string
  middle_name?: string
  last_name: string
  date_of_birth: string
  sex: string
  primary_language?: string
  email?: string
  phone?: string
  street: string
  city: string
  state: string
  zip_code: string
  emergency_contacts?: EmergencyContactInput[]
  insurance?: InsuranceInput
  medical?: MedicalInput
}

export interface EditDemographicsRequest {
  first_name?: string
  middle_name?: string
  last_name?: string
  date_of_birth?: string
  sex?: string
  primary_language?: string
  email?: string
  phone?: string
  street?: string
  city?: string
  state?: string
  zip_code?: string
}

export interface EditStatusRequest {
  status: string
  notes?: string
  referral_source?: string
}

export interface EditContactsRequest {
  contacts: EmergencyContactInput[]
}

export interface CreateAppointmentRequest {
  provider_name: string
  appointment_type: string
  date_time: string
  duration_minutes?: number
  location?: string
  notes?: string
  status?: string
}

export interface EditAppointmentRequest {
  provider_name?: string
  appointment_type?: string
  date_time?: string
  duration_minutes?: number
  location?: string
  notes?: string
  status?: string
}

export interface CreateVisitRequest {
  provider_name: string
  visit_type: string
  visit_date: string
  summary?: string
  diagnosis?: string
  follow_up_needed?: boolean
}

export interface EditVisitRequest {
  provider_name?: string
  visit_type?: string
  visit_date?: string
  summary?: string
  diagnosis?: string
  follow_up_needed?: boolean
}

export interface CreateImmunizationRequest {
  vaccine_name: string
  date_administered: string
  administered_by?: string
  dose_number?: number
  lot_number?: string
  next_due_date?: string
  notes?: string
}

export interface EditImmunizationRequest {
  vaccine_name?: string
  date_administered?: string
  administered_by?: string
  dose_number?: number
  lot_number?: string
  next_due_date?: string
  notes?: string
}

export interface CreatePrescriptionRequest {
  medication_id: string
  dosage: string
  frequency: string
  quantity: number
  duration?: string
  pharmacy_name: string
  pharmacy_address: string
  pharmacy_lat: number
  pharmacy_lng: number
  notes?: string
  save_as_preferred_pharmacy?: boolean
}

// ======================== Param types ========================

export interface PatientListParams {
  page?: number
  page_size?: number
  status?: PatientStatus
  search?: string
  sort_by?: SortColumn
  sort_order?: 'asc' | 'desc'
}

export interface PharmacySearchParams {
  lat: number
  lng: number
  radius?: number
}
