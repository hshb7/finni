import { z } from 'zod'
import {
  SEX_OPTIONS,
  RELATIONSHIPS,
  HOLDER_RELATIONSHIPS,
  APPOINTMENT_TYPES,
  APPOINTMENT_STATUSES,
  VISIT_TYPES,
  PATIENT_STATUSES,
} from './constants'

const optionalString = z.string().optional().or(z.literal(''))

// ======================== Patient creation (multi-step) ========================

export const basicInfoSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  middle_name: optionalString,
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  sex: z.enum(SEX_OPTIONS, { message: 'Sex is required' }),
  primary_language: z.string().optional().default('English'),
})
export type BasicInfoValues = z.infer<typeof basicInfoSchema>

export const contactAddressSchema = z.object({
  email: optionalString,
  phone: optionalString,
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'Use 2-letter abbreviation'),
  zip_code: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
})
export type ContactAddressValues = z.infer<typeof contactAddressSchema>

export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  relationship: z.enum(RELATIONSHIPS, { message: 'Relationship is required' }),
  phone: z.string().min(1, 'Phone number is required'),
  email: optionalString,
  is_primary: z.boolean().optional().default(false),
})
export type EmergencyContactValues = z.infer<typeof emergencyContactSchema>

export const emergencyContactsSchema = z.object({
  contacts: z.array(emergencyContactSchema).min(1, 'At least one contact is required'),
})
export type EmergencyContactsValues = z.infer<typeof emergencyContactsSchema>

export const insuranceSchema = z.object({
  provider_name: z.string().min(1, 'Provider name is required'),
  policy_number: z.string().min(1, 'Policy number is required'),
  group_number: optionalString,
  holder_name: z.string().min(1, 'Holder name is required'),
  holder_relationship: z.enum(HOLDER_RELATIONSHIPS, { message: 'Relationship is required' }),
})
export type InsuranceValues = z.infer<typeof insuranceSchema>

export const medicalSchema = z.object({
  primary_diagnosis: optionalString,
  allergies: optionalString,
  current_medications: optionalString,
  additional_conditions: optionalString,
})
export type MedicalValues = z.infer<typeof medicalSchema>

export const createPatientSchema = basicInfoSchema
  .merge(contactAddressSchema)
  .extend({
    emergency_contacts: z.array(emergencyContactSchema).optional(),
    insurance: insuranceSchema.optional(),
    medical: medicalSchema.optional(),
    avatar_url: z.string().url().nullable().optional(),
  })
export type CreatePatientValues = z.infer<typeof createPatientSchema>

// ======================== Patient edit schemas ========================

export const editDemographicsSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  middle_name: optionalString,
  last_name: z.string().min(1, 'Last name is required').optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required').optional(),
  sex: z.enum(SEX_OPTIONS).optional(),
  primary_language: optionalString,
  email: optionalString,
  phone: optionalString,
  street: z.string().min(1, 'Street is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  state: z.string().min(2).max(2).optional(),
  zip_code: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits').optional(),
  avatar_url: z.string().url().nullable().optional(),
})
export type EditDemographicsValues = z.infer<typeof editDemographicsSchema>

export const editStatusSchema = z.object({
  status: z.enum(PATIENT_STATUSES, { message: 'Status is required' }),
  notes: optionalString,
  referral_source: optionalString,
})
export type EditStatusValues = z.infer<typeof editStatusSchema>

// ======================== Clinical schemas ========================

export const appointmentSchema = z.object({
  provider_name: z.string().min(1, 'Provider name is required'),
  appointment_type: z.enum(APPOINTMENT_TYPES, { message: 'Type is required' }),
  date_time: z.string().min(1, 'Date and time is required'),
  duration_minutes: z.coerce.number().int().positive().optional().default(30),
  location: optionalString,
  notes: optionalString,
  status: z.enum(APPOINTMENT_STATUSES).optional().default('Scheduled'),
})
export type AppointmentValues = z.infer<typeof appointmentSchema>

export const visitSchema = z.object({
  provider_name: z.string().min(1, 'Provider name is required'),
  visit_type: z.enum(VISIT_TYPES, { message: 'Visit type is required' }),
  visit_date: z.string().min(1, 'Visit date is required'),
  summary: optionalString,
  diagnosis: optionalString,
  follow_up_needed: z.boolean().optional().default(false),
})
export type VisitValues = z.infer<typeof visitSchema>

export const immunizationSchema = z.object({
  vaccine_name: z.string().min(1, 'Vaccine name is required'),
  date_administered: z.string().min(1, 'Date administered is required'),
  administered_by: optionalString,
  dose_number: z.coerce.number().int().positive().optional(),
  lot_number: optionalString,
  next_due_date: optionalString,
  notes: optionalString,
})
export type ImmunizationValues = z.infer<typeof immunizationSchema>

export const prescriptionSchema = z.object({
  medication_id: z.string().min(1, 'Medication is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  duration: optionalString,
  pharmacy_name: z.string().min(1, 'Pharmacy is required'),
  pharmacy_address: z.string().min(1, 'Pharmacy address is required'),
  pharmacy_lat: z.coerce.number(),
  pharmacy_lng: z.coerce.number(),
  notes: optionalString,
  save_as_preferred_pharmacy: z.boolean().optional().default(false),
})
export type PrescriptionValues = z.infer<typeof prescriptionSchema>

export const pharmacySchema = z.object({
  name: z.string().min(1, 'Pharmacy name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: optionalString,
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
})
export type PharmacyValues = z.infer<typeof pharmacySchema>

// ======================== Auth schemas ========================

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})
export type RegisterValues = z.infer<typeof registerSchema>

export const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  role: z.enum(['Staff', 'Administrator', 'Provider', 'Nurse'] as const, { message: 'Role is required' }),
  phone: optionalString,
})
export type ProfileValues = z.infer<typeof profileSchema>

export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'] as const),
  notifications_enabled: z.boolean(),
  page_size: z.coerce.number().refine(v => [10, 20, 50].includes(v)),
  date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] as const),
})
export type SettingsValues = z.infer<typeof settingsSchema>
