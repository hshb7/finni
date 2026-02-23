export const PATIENT_STATUSES = ['Inquiry', 'Onboarding', 'Active', 'Churned'] as const
export type PatientStatus = (typeof PATIENT_STATUSES)[number]

export const SEX_OPTIONS = ['Male', 'Female', 'Other'] as const
export type Sex = (typeof SEX_OPTIONS)[number]

export const RELATIONSHIPS = ['Parent', 'Spouse', 'Sibling', 'Guardian', 'Other'] as const
export type Relationship = (typeof RELATIONSHIPS)[number]

export const HOLDER_RELATIONSHIPS = ['Self', 'Spouse', 'Parent', 'Other'] as const
export type HolderRelationship = (typeof HOLDER_RELATIONSHIPS)[number]

export const APPOINTMENT_TYPES = ['Check-up', 'Follow-up', 'Initial Consultation', 'Urgent', 'Other'] as const
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number]

export const APPOINTMENT_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No-Show'] as const
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

export const VISIT_TYPES = ['Check-up', 'Follow-up', 'Sick Visit', 'Procedure', 'Other'] as const
export type VisitType = (typeof VISIT_TYPES)[number]

export const MEDICATION_FORMS = ['tablet', 'capsule', 'inhaler', 'liquid'] as const
export type MedicationForm = (typeof MEDICATION_FORMS)[number]

export const FREQUENCY_OPTIONS = [
  'Once daily', 'Twice daily', 'Three times daily',
  'Four times daily', 'As needed', 'At bedtime',
] as const
export type Frequency = (typeof FREQUENCY_OPTIONS)[number]

export const SORT_COLUMNS = ['created_at', 'first_name', 'last_name', 'date_of_birth', 'status', 'city', 'state'] as const
export type SortColumn = (typeof SORT_COLUMNS)[number]

export const US_STATES = [
  { abbreviation: 'AL', name: 'Alabama' },
  { abbreviation: 'AK', name: 'Alaska' },
  { abbreviation: 'AZ', name: 'Arizona' },
  { abbreviation: 'AR', name: 'Arkansas' },
  { abbreviation: 'CA', name: 'California' },
  { abbreviation: 'CO', name: 'Colorado' },
  { abbreviation: 'CT', name: 'Connecticut' },
  { abbreviation: 'DE', name: 'Delaware' },
  { abbreviation: 'DC', name: 'District of Columbia' },
  { abbreviation: 'FL', name: 'Florida' },
  { abbreviation: 'GA', name: 'Georgia' },
  { abbreviation: 'HI', name: 'Hawaii' },
  { abbreviation: 'ID', name: 'Idaho' },
  { abbreviation: 'IL', name: 'Illinois' },
  { abbreviation: 'IN', name: 'Indiana' },
  { abbreviation: 'IA', name: 'Iowa' },
  { abbreviation: 'KS', name: 'Kansas' },
  { abbreviation: 'KY', name: 'Kentucky' },
  { abbreviation: 'LA', name: 'Louisiana' },
  { abbreviation: 'ME', name: 'Maine' },
  { abbreviation: 'MD', name: 'Maryland' },
  { abbreviation: 'MA', name: 'Massachusetts' },
  { abbreviation: 'MI', name: 'Michigan' },
  { abbreviation: 'MN', name: 'Minnesota' },
  { abbreviation: 'MS', name: 'Mississippi' },
  { abbreviation: 'MO', name: 'Missouri' },
  { abbreviation: 'MT', name: 'Montana' },
  { abbreviation: 'NE', name: 'Nebraska' },
  { abbreviation: 'NV', name: 'Nevada' },
  { abbreviation: 'NH', name: 'New Hampshire' },
  { abbreviation: 'NJ', name: 'New Jersey' },
  { abbreviation: 'NM', name: 'New Mexico' },
  { abbreviation: 'NY', name: 'New York' },
  { abbreviation: 'NC', name: 'North Carolina' },
  { abbreviation: 'ND', name: 'North Dakota' },
  { abbreviation: 'OH', name: 'Ohio' },
  { abbreviation: 'OK', name: 'Oklahoma' },
  { abbreviation: 'OR', name: 'Oregon' },
  { abbreviation: 'PA', name: 'Pennsylvania' },
  { abbreviation: 'RI', name: 'Rhode Island' },
  { abbreviation: 'SC', name: 'South Carolina' },
  { abbreviation: 'SD', name: 'South Dakota' },
  { abbreviation: 'TN', name: 'Tennessee' },
  { abbreviation: 'TX', name: 'Texas' },
  { abbreviation: 'UT', name: 'Utah' },
  { abbreviation: 'VT', name: 'Vermont' },
  { abbreviation: 'VA', name: 'Virginia' },
  { abbreviation: 'WA', name: 'Washington' },
  { abbreviation: 'WV', name: 'West Virginia' },
  { abbreviation: 'WI', name: 'Wisconsin' },
  { abbreviation: 'WY', name: 'Wyoming' },
] as const
export type StateAbbreviation = (typeof US_STATES)[number]['abbreviation']
