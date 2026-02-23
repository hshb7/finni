import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


# ============================= Request schemas =============================


# --- Patient creation (multi-step flow) ---
class EmergencyContactInput(BaseModel):
    name: str
    relationship: str
    phone: str
    email: Optional[str] = None
    is_primary: Optional[bool] = False


class InsuranceInput(BaseModel):
    provider_name: str
    policy_number: str
    group_number: Optional[str] = None
    holder_name: str
    holder_relationship: str


class MedicalInput(BaseModel):
    primary_diagnosis: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    additional_conditions: Optional[str] = None


class CreatePatientRequest(BaseModel):
    # Step 1 - Basic Info (required)
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    date_of_birth: datetime.date
    sex: str
    primary_language: Optional[str] = "English"
    # Step 2 - Contact & Address (required)
    email: Optional[str] = None
    phone: Optional[str] = None
    street: str
    city: str
    state: str
    zip_code: str
    # Step 3 - Emergency Contacts (optional)
    emergency_contacts: Optional[list[EmergencyContactInput]] = None
    # Step 4 - Insurance (optional)
    insurance: Optional[InsuranceInput] = None
    # Step 5 - Medical Info (optional)
    medical: Optional[MedicalInput] = None


# --- Demographics edit ---
class EditDemographicsRequest(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[datetime.date] = None
    sex: Optional[str] = None
    primary_language: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None


# --- Status edit ---
class EditStatusRequest(BaseModel):
    status: str
    notes: Optional[str] = None
    referral_source: Optional[str] = None


# --- Contacts edit (PUT = full replacement) ---
class EditContactsRequest(BaseModel):
    contacts: list[EmergencyContactInput]


# --- Insurance edit (upsert) ---
class EditInsuranceRequest(InsuranceInput):
    pass


# --- Medical edit (upsert) ---
class EditMedicalRequest(MedicalInput):
    pass


# --- Pharmacy edit (upsert) ---
class EditPharmacyRequest(BaseModel):
    name: str
    address: str
    phone: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


# --- Appointments ---
class CreateAppointmentRequest(BaseModel):
    provider_name: str
    appointment_type: str
    date_time: datetime.datetime
    duration_minutes: Optional[int] = 30
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "Scheduled"


class EditAppointmentRequest(BaseModel):
    provider_name: Optional[str] = None
    appointment_type: Optional[str] = None
    date_time: Optional[datetime.datetime] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


# --- Visits ---
class CreateVisitRequest(BaseModel):
    provider_name: str
    visit_type: str
    visit_date: datetime.date
    summary: Optional[str] = None
    diagnosis: Optional[str] = None
    follow_up_needed: Optional[bool] = False


class EditVisitRequest(BaseModel):
    provider_name: Optional[str] = None
    visit_type: Optional[str] = None
    visit_date: Optional[datetime.date] = None
    summary: Optional[str] = None
    diagnosis: Optional[str] = None
    follow_up_needed: Optional[bool] = None


# --- Immunizations ---
class CreateImmunizationRequest(BaseModel):
    vaccine_name: str
    date_administered: datetime.date
    administered_by: Optional[str] = None
    dose_number: Optional[int] = None
    lot_number: Optional[str] = None
    next_due_date: Optional[datetime.date] = None
    notes: Optional[str] = None


class EditImmunizationRequest(BaseModel):
    vaccine_name: Optional[str] = None
    date_administered: Optional[datetime.date] = None
    administered_by: Optional[str] = None
    dose_number: Optional[int] = None
    lot_number: Optional[str] = None
    next_due_date: Optional[datetime.date] = None
    notes: Optional[str] = None


# --- Prescriptions ---
class CreatePrescriptionRequest(BaseModel):
    medication_id: UUID
    dosage: str
    frequency: str
    quantity: int
    duration: Optional[str] = None
    pharmacy_name: str
    pharmacy_address: str
    pharmacy_lat: float
    pharmacy_lng: float
    notes: Optional[str] = None
    save_as_preferred_pharmacy: Optional[bool] = False


# ============================ Response schemas =============================


# --- Entity responses ---
class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    date_of_birth: datetime.date
    sex: str
    primary_language: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    street: str
    city: str
    state: str
    zip_code: str
    status: str
    referral_source: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class EmergencyContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    name: str
    relationship: str
    phone: str
    email: Optional[str] = None
    is_primary: Optional[bool] = False


class InsuranceInfoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    provider_name: str
    policy_number: str
    group_number: Optional[str] = None
    holder_name: str
    holder_relationship: str


class MedicalInfoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    primary_diagnosis: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    additional_conditions: Optional[str] = None


class PreferredPharmacyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    name: str
    address: str
    phone: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    provider_name: str
    appointment_type: str
    date_time: datetime.datetime
    duration_minutes: Optional[int] = 30
    location: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime.datetime


class VisitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    provider_name: str
    visit_type: str
    visit_date: datetime.date
    summary: Optional[str] = None
    diagnosis: Optional[str] = None
    follow_up_needed: Optional[bool] = False
    created_at: datetime.datetime


class ImmunizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    vaccine_name: str
    date_administered: datetime.date
    administered_by: Optional[str] = None
    dose_number: Optional[int] = None
    lot_number: Optional[str] = None
    next_due_date: Optional[datetime.date] = None
    notes: Optional[str] = None


class MedicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    generic_name: Optional[str] = None
    description: Optional[str] = None
    common_dosages: str
    form: str
    category: str


class PrescriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    medication_id: UUID
    dosage: str
    frequency: str
    quantity: int
    duration: Optional[str] = None
    pharmacy_name: str
    pharmacy_address: str
    pharmacy_lat: float
    pharmacy_lng: float
    prescribed_at: datetime.datetime
    notes: Optional[str] = None
    medication: Optional[MedicationResponse] = None


class StatusHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    old_status: Optional[str] = None
    new_status: str
    changed_at: datetime.datetime


# --- Composite / list responses ---
class PatientDetailResponse(PatientResponse):
    emergency_contacts: list[EmergencyContactResponse] = []
    insurance_info: Optional[InsuranceInfoResponse] = None
    medical_info: Optional[MedicalInfoResponse] = None
    preferred_pharmacy: Optional[PreferredPharmacyResponse] = None
    appointments: list[AppointmentResponse] = []
    visits: list[VisitResponse] = []
    immunizations: list[ImmunizationResponse] = []
    prescriptions: list[PrescriptionResponse] = []
    status_history: list[StatusHistoryResponse] = []


class PatientListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    first_name: str
    last_name: str
    date_of_birth: datetime.date
    status: str
    city: str
    state: str
    phone: Optional[str] = None
    created_at: datetime.datetime


class PatientListResponse(BaseModel):
    items: list[PatientListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# --- Dashboard stats ---
class StatusCount(BaseModel):
    status: str
    count: int


class StatsOverviewResponse(BaseModel):
    status_counts: list[StatusCount]
    total_patients: int


class TrendDataPoint(BaseModel):
    period: str
    inquiry: int = 0
    onboarding: int = 0
    active: int = 0
    churned: int = 0


class StatsTrendsResponse(BaseModel):
    trends: list[TrendDataPoint]


# --- Recent Appointments (dashboard) ---
class RecentAppointmentItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    patient_id: UUID
    patient_name: str
    provider_name: str
    appointment_type: str
    date_time: datetime.datetime
    duration_minutes: int | None
    status: str


class RecentAppointmentsResponse(BaseModel):
    upcoming: list[RecentAppointmentItem]
    total_scheduled: int
    total_completed: int
    total_cancelled: int
    total_no_show: int


# --- Care Gaps ---
class CareGapItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    patient_id: UUID
    patient_name: str
    visit_date: datetime.date
    diagnosis: str | None
    days_since_visit: int


class CareGapsResponse(BaseModel):
    items: list[CareGapItem]
    total_count: int


# --- New Patients Trend ---
class NewPatientsDataPoint(BaseModel):
    period: str
    count: int


class NewPatientsTrendResponse(BaseModel):
    trends: list[NewPatientsDataPoint]


# --- Top Medications ---
class TopMedicationItem(BaseModel):
    medication_name: str
    category: str
    count: int


class TopMedicationsResponse(BaseModel):
    items: list[TopMedicationItem]


# --- Recent Activity ---
class ActivityItem(BaseModel):
    event_type: str
    description: str
    actor_name: str
    patient_name: str
    patient_id: UUID
    timestamp: datetime.datetime
    detail: str | None = None


class RecentActivityResponse(BaseModel):
    items: list[ActivityItem]


# --- Pharmacy search ---
class PharmacyResult(BaseModel):
    name: str
    address: str
    lat: float
    lng: float
    distance: Optional[float] = None
    rating: Optional[float] = None
    open_now: Optional[bool] = None


class PharmacySearchResponse(BaseModel):
    results: list[PharmacyResult]
