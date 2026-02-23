import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, text
from sqlmodel import Field, Relationship, SQLModel


# ---------------------------------------------------------------------------
# patients
# ---------------------------------------------------------------------------
class Patient(SQLModel, table=True):
    __tablename__ = "patients"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    first_name: str = Field(max_length=100)
    middle_name: Optional[str] = Field(default=None, max_length=100)
    last_name: str = Field(max_length=100)
    date_of_birth: datetime.date
    sex: str = Field(max_length=20)
    primary_language: Optional[str] = Field(default="English", max_length=50)
    email: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    street: str = Field(max_length=255)
    city: str = Field(max_length=100)
    state: str = Field(max_length=2)
    zip_code: str = Field(max_length=5)
    status: str = Field(default="Inquiry", max_length=20)
    referral_source: Optional[str] = Field(default=None, max_length=255)
    notes: Optional[str] = Field(default=None)
    created_at: datetime.datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("NOW()"),
            nullable=False,
        )
    )
    updated_at: datetime.datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("NOW()"),
            nullable=False,
        )
    )

    # relationships
    emergency_contacts: list["EmergencyContact"] = Relationship(
        back_populates="patient"
    )
    insurance_info: Optional["InsuranceInfo"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"uselist": False},
    )
    medical_info: Optional["MedicalInfo"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"uselist": False},
    )
    preferred_pharmacy: Optional["PreferredPharmacy"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"uselist": False},
    )
    appointments: list["Appointment"] = Relationship(back_populates="patient")
    visits: list["Visit"] = Relationship(back_populates="patient")
    immunizations: list["Immunization"] = Relationship(back_populates="patient")
    prescriptions: list["Prescription"] = Relationship(back_populates="patient")
    status_history: list["StatusHistory"] = Relationship(back_populates="patient")


# ---------------------------------------------------------------------------
# emergency_contacts
# ---------------------------------------------------------------------------
class EmergencyContact(SQLModel, table=True):
    __tablename__ = "emergency_contacts"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    patient_id: UUID = Field(foreign_key="patients.id")
    name: str = Field(max_length=200)
    relationship: str = Field(max_length=50)
    phone: str = Field(max_length=20)
    email: Optional[str] = Field(default=None, max_length=255)
    is_primary: Optional[bool] = Field(default=False)

    patient: Optional[Patient] = Relationship(back_populates="emergency_contacts")


# ---------------------------------------------------------------------------
# insurance_info
# ---------------------------------------------------------------------------
class InsuranceInfo(SQLModel, table=True):
    __tablename__ = "insurance_info"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    patient_id: UUID = Field(foreign_key="patients.id", unique=True)
    provider_name: str = Field(max_length=200)
    policy_number: str = Field(max_length=100)
    group_number: Optional[str] = Field(default=None, max_length=100)
    holder_name: str = Field(max_length=200)
    holder_relationship: str = Field(max_length=50)

    patient: Optional[Patient] = Relationship(back_populates="insurance_info")


# ---------------------------------------------------------------------------
# medical_info
# ---------------------------------------------------------------------------
class MedicalInfo(SQLModel, table=True):
    __tablename__ = "medical_info"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    patient_id: UUID = Field(foreign_key="patients.id", unique=True)
    primary_diagnosis: Optional[str] = Field(default=None, max_length=255)
    allergies: Optional[str] = Field(default=None)
    current_medications: Optional[str] = Field(default=None)
    additional_conditions: Optional[str] = Field(default=None)

    patient: Optional[Patient] = Relationship(back_populates="medical_info")


# ---------------------------------------------------------------------------
# preferred_pharmacy
# ---------------------------------------------------------------------------
class PreferredPharmacy(SQLModel, table=True):
    __tablename__ = "preferred_pharmacy"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    patient_id: UUID = Field(foreign_key="patients.id", unique=True)
    name: str = Field(max_length=255)
    address: str = Field(max_length=500)
    phone: Optional[str] = Field(default=None, max_length=20)
    lat: Optional[float] = Field(default=None)
    lng: Optional[float] = Field(default=None)

    patient: Optional[Patient] = Relationship(back_populates="preferred_pharmacy")


# ---------------------------------------------------------------------------
# appointments
# ---------------------------------------------------------------------------
class Appointment(SQLModel, table=True):
    __tablename__ = "appointments"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    patient_id: UUID = Field(foreign_key="patients.id")
    provider_name: str = Field(max_length=200)
    appointment_type: str = Field(max_length=100)
    date_time: datetime.datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    duration_minutes: Optional[int] = Field(default=30)
    location: Optional[str] = Field(default=None, max_length=255)
    notes: Optional[str] = Field(default=None)
    status: str = Field(default="Scheduled", max_length=20)
    created_at: datetime.datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("NOW()"),
            nullable=False,
        )
    )

    patient: Optional[Patient] = Relationship(back_populates="appointments")


# ---------------------------------------------------------------------------
# visits
# ---------------------------------------------------------------------------
class Visit(SQLModel, table=True):
    __tablename__ = "visits"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    patient_id: UUID = Field(foreign_key="patients.id")
    provider_name: str = Field(max_length=200)
    visit_type: str = Field(max_length=100)
    visit_date: datetime.date
    summary: Optional[str] = Field(default=None)
    diagnosis: Optional[str] = Field(default=None, max_length=255)
    follow_up_needed: Optional[bool] = Field(default=False)
    created_at: datetime.datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("NOW()"),
            nullable=False,
        )
    )

    patient: Optional[Patient] = Relationship(back_populates="visits")


# ---------------------------------------------------------------------------
# immunizations
# ---------------------------------------------------------------------------
class Immunization(SQLModel, table=True):
    __tablename__ = "immunizations"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    patient_id: UUID = Field(foreign_key="patients.id")
    vaccine_name: str = Field(max_length=200)
    date_administered: datetime.date
    administered_by: Optional[str] = Field(default=None, max_length=200)
    dose_number: Optional[int] = Field(default=None)
    lot_number: Optional[str] = Field(default=None, max_length=100)
    next_due_date: Optional[datetime.date] = Field(default=None)
    notes: Optional[str] = Field(default=None)

    patient: Optional[Patient] = Relationship(back_populates="immunizations")


# ---------------------------------------------------------------------------
# medications (static lookup table)
# ---------------------------------------------------------------------------
class Medication(SQLModel, table=True):
    __tablename__ = "medications"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    name: str = Field(max_length=200, unique=True)
    generic_name: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None)
    common_dosages: str = Field(max_length=255)
    form: str = Field(max_length=50)
    category: str = Field(max_length=100)


# ---------------------------------------------------------------------------
# prescriptions
# ---------------------------------------------------------------------------
class Prescription(SQLModel, table=True):
    __tablename__ = "prescriptions"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    patient_id: UUID = Field(foreign_key="patients.id")
    medication_id: UUID = Field(foreign_key="medications.id")
    dosage: str = Field(max_length=100)
    frequency: str = Field(max_length=100)
    quantity: int
    duration: Optional[str] = Field(default=None, max_length=100)
    pharmacy_name: str = Field(max_length=255)
    pharmacy_address: str = Field(max_length=500)
    pharmacy_lat: float
    pharmacy_lng: float
    prescribed_at: datetime.datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("NOW()"),
            nullable=False,
        )
    )
    notes: Optional[str] = Field(default=None)

    patient: Optional[Patient] = Relationship(back_populates="prescriptions")
    medication: Optional[Medication] = Relationship()


# ---------------------------------------------------------------------------
# status_history
# ---------------------------------------------------------------------------
class StatusHistory(SQLModel, table=True):
    __tablename__ = "status_history"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    patient_id: UUID = Field(foreign_key="patients.id")
    old_status: Optional[str] = Field(default=None, max_length=20)
    new_status: str = Field(max_length=20)
    changed_at: datetime.datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("NOW()"),
            nullable=False,
        )
    )

    patient: Optional[Patient] = Relationship(back_populates="status_history")
