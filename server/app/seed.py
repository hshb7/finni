"""Generate ~50 demo patients with realistic data spanning 6 months."""

import datetime
import random
from uuid import uuid4

from sqlmodel import Session, select

from app.database import engine
from app.models import (
    Appointment,
    EmergencyContact,
    Immunization,
    InsuranceInfo,
    MedicalInfo,
    Patient,
    PreferredPharmacy,
    Prescription,
    StatusHistory,
    Visit,
    Medication,
)

FIRST_NAMES = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael",
    "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan",
    "Joseph", "Jessica", "Thomas", "Sarah", "Christopher", "Karen", "Daniel",
    "Lisa", "Matthew", "Nancy", "Anthony", "Betty", "Mark", "Margaret",
    "Charles", "Sandra", "Steven", "Ashley", "Andrew", "Dorothy", "Paul",
    "Kimberly", "Joshua", "Emily", "Kenneth", "Donna", "Kevin", "Michelle",
    "Brian", "Carol", "George", "Amanda", "Timothy", "Melissa", "Ronald", "Deborah",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
    "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
    "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
]

CITIES = [
    ("New York", "NY", "10001"), ("Los Angeles", "CA", "90001"),
    ("Chicago", "IL", "60601"), ("Houston", "TX", "77001"),
    ("Phoenix", "AZ", "85001"), ("Philadelphia", "PA", "19101"),
    ("San Antonio", "TX", "78201"), ("San Diego", "CA", "92101"),
    ("Dallas", "TX", "75201"), ("Austin", "TX", "73301"),
    ("Portland", "OR", "97201"), ("Denver", "CO", "80201"),
    ("Seattle", "WA", "98101"), ("Boston", "MA", "02101"),
    ("Nashville", "TN", "37201"), ("Atlanta", "GA", "30301"),
]

STREETS = [
    "123 Main St", "456 Oak Ave", "789 Elm Blvd", "321 Pine Dr",
    "654 Maple Ln", "987 Cedar Way", "111 Birch Ct", "222 Walnut St",
    "333 Spruce Ave", "444 Ash Rd", "555 Willow Pl", "666 Cherry St",
    "777 Poplar Dr", "888 Juniper Ln", "999 Sycamore Blvd",
]

SEXES = ["Male", "Female"]
LANGUAGES = ["English", "Spanish", "Mandarin", "French", "Vietnamese", "Korean"]
STATUSES = ["Inquiry", "Onboarding", "Active", "Churned"]
REFERRAL_SOURCES = [
    "Google Search", "Doctor Referral", "Friend/Family", "Insurance Directory",
    "Social Media", "Walk-in", "Hospital Referral", None,
]

PROVIDERS = [
    "Dr. Sarah Chen", "Dr. Michael Park", "Dr. Emily Rodriguez",
    "Dr. James Wilson", "Dr. Lisa Thompson", "Dr. Robert Kim",
]

APPOINTMENT_TYPES = ["Check-up", "Follow-up", "Initial Consultation", "Urgent", "Other"]
VISIT_TYPES = ["Check-up", "Follow-up", "Sick Visit", "Procedure", "Other"]
DIAGNOSES = [
    "Hypertension", "Type 2 Diabetes", "Asthma", "ADHD",
    "Anxiety Disorder", "Seasonal Allergies", "Upper Respiratory Infection",
    "Lower Back Pain", "Migraine", None,
]

VACCINES = [
    ("Influenza", 1), ("COVID-19", 2), ("Tdap", 1), ("Hepatitis B", 3),
    ("MMR", 2), ("Pneumococcal", 1), ("Shingles", 2),
]

ALLERGIES_LIST = [
    "Penicillin", "Sulfa drugs", "Latex", "Peanuts", "Shellfish",
    "None known", "Ibuprofen", "Aspirin",
]

INSURANCE_PROVIDERS = [
    "Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna",
    "Humana", "Kaiser Permanente", "Anthem",
]

RELATIONSHIPS = ["Spouse", "Parent", "Sibling", "Guardian", "Other"]

PHARMACIES = [
    ("CVS Pharmacy", "100 Broadway"),
    ("Walgreens", "200 Market St"),
    ("Rite Aid", "300 Main St"),
    ("Walmart Pharmacy", "400 Commerce Dr"),
    ("Costco Pharmacy", "500 Industrial Blvd"),
]


def _random_date(start: datetime.date, end: datetime.date) -> datetime.date:
    delta = (end - end.__class__(start.year, start.month, start.day)).days
    if delta <= 0:
        return start
    return start + datetime.timedelta(days=random.randint(0, delta))


def _random_datetime(start: datetime.date, end: datetime.date) -> datetime.datetime:
    d = _random_date(start, end)
    hour = random.randint(8, 17)
    minute = random.choice([0, 15, 30, 45])
    return datetime.datetime(d.year, d.month, d.day, hour, minute, tzinfo=datetime.timezone.utc)


def seed_database():
    """Populate database with demo data. Skips if patients already exist."""
    with Session(engine) as session:
        existing = session.exec(select(Patient).limit(1)).first()
        if existing:
            return {"message": "Database already seeded", "patients_created": 0}

        # Load medication IDs
        medications = session.exec(select(Medication)).all()
        if not medications:
            return {"message": "No medications found. Run migration first.", "patients_created": 0}
        med_ids = [m.id for m in medications]

        today = datetime.date.today()
        six_months_ago = today - datetime.timedelta(days=180)

        patients_created = 0

        for i in range(50):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            city, state, zip_code = random.choice(CITIES)
            sex = random.choice(SEXES)

            # Weight statuses: more Active patients
            status = random.choices(
                STATUSES, weights=[15, 20, 50, 15], k=1
            )[0]

            dob = _random_date(
                datetime.date(1950, 1, 1),
                datetime.date(2005, 12, 31),
            )
            created_at = _random_datetime(six_months_ago, today)

            patient = Patient(
                id=uuid4(),
                first_name=first_name,
                last_name=last_name,
                date_of_birth=dob,
                sex=sex,
                primary_language=random.choice(LANGUAGES),
                email=f"{first_name.lower()}.{last_name.lower()}{i}@email.com",
                phone=f"({random.randint(200,999)}) {random.randint(200,999)}-{random.randint(1000,9999)}",
                street=random.choice(STREETS),
                city=city,
                state=state,
                zip_code=zip_code,
                status=status,
                referral_source=random.choice(REFERRAL_SOURCES),
                notes=random.choice([None, "New patient", "Transferred from another clinic", "VIP patient"]),
                created_at=created_at,
                updated_at=created_at,
            )
            session.add(patient)
            session.flush()

            # Status history — initial + maybe transitions
            history_date = created_at
            session.add(StatusHistory(
                patient_id=patient.id,
                old_status=None,
                new_status="Inquiry",
                changed_at=history_date,
            ))

            if status != "Inquiry":
                history_date = history_date + datetime.timedelta(days=random.randint(1, 14))
                session.add(StatusHistory(
                    patient_id=patient.id,
                    old_status="Inquiry",
                    new_status="Onboarding",
                    changed_at=history_date,
                ))
            if status in ("Active", "Churned"):
                history_date = history_date + datetime.timedelta(days=random.randint(3, 21))
                session.add(StatusHistory(
                    patient_id=patient.id,
                    old_status="Onboarding",
                    new_status="Active",
                    changed_at=history_date,
                ))
            if status == "Churned":
                history_date = history_date + datetime.timedelta(days=random.randint(14, 60))
                session.add(StatusHistory(
                    patient_id=patient.id,
                    old_status="Active",
                    new_status="Churned",
                    changed_at=history_date,
                ))

            # Emergency contacts (1-2)
            for j in range(random.randint(1, 2)):
                session.add(EmergencyContact(
                    patient_id=patient.id,
                    name=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                    relationship=random.choice(RELATIONSHIPS),
                    phone=f"({random.randint(200,999)}) {random.randint(200,999)}-{random.randint(1000,9999)}",
                    email=f"contact{i}_{j}@email.com" if random.random() > 0.3 else None,
                    is_primary=j == 0,
                ))

            # Insurance (80% of patients)
            if random.random() < 0.8:
                session.add(InsuranceInfo(
                    patient_id=patient.id,
                    provider_name=random.choice(INSURANCE_PROVIDERS),
                    policy_number=f"POL-{random.randint(100000, 999999)}",
                    group_number=f"GRP-{random.randint(1000, 9999)}" if random.random() > 0.3 else None,
                    holder_name=f"{first_name} {last_name}",
                    holder_relationship="Self",
                ))

            # Medical info (70% of patients)
            if random.random() < 0.7:
                allergies = ", ".join(random.sample(ALLERGIES_LIST, random.randint(1, 3)))
                session.add(MedicalInfo(
                    patient_id=patient.id,
                    primary_diagnosis=random.choice(DIAGNOSES),
                    allergies=allergies,
                    current_medications=random.choice([None, "Metformin 500mg", "Lisinopril 10mg", "Albuterol inhaler"]),
                    additional_conditions=random.choice([None, "Mild anxiety", "Seasonal allergies", "Pre-diabetes"]),
                ))

            # Preferred pharmacy (60% of patients)
            if random.random() < 0.6:
                ph_name, ph_street = random.choice(PHARMACIES)
                session.add(PreferredPharmacy(
                    patient_id=patient.id,
                    name=ph_name,
                    address=f"{ph_street}, {city}, {state} {zip_code}",
                    phone=f"({random.randint(200,999)}) {random.randint(200,999)}-{random.randint(1000,9999)}",
                    lat=round(random.uniform(25.0, 48.0), 6),
                    lng=round(random.uniform(-122.0, -73.0), 6),
                ))

            # Appointments (0-4 per patient)
            for _ in range(random.randint(0, 4)):
                apt_status = random.choice(["Scheduled", "Completed", "Cancelled", "No-Show"])
                session.add(Appointment(
                    patient_id=patient.id,
                    provider_name=random.choice(PROVIDERS),
                    appointment_type=random.choice(APPOINTMENT_TYPES),
                    date_time=_random_datetime(six_months_ago, today + datetime.timedelta(days=30)),
                    duration_minutes=random.choice([15, 30, 45, 60]),
                    location=random.choice(["Main Office", "Telehealth", "Branch Office"]),
                    notes=random.choice([None, "Please bring insurance card", "Follow-up needed"]),
                    status=apt_status,
                ))

            # Visits (0-3 per patient)
            for _ in range(random.randint(0, 3)):
                session.add(Visit(
                    patient_id=patient.id,
                    provider_name=random.choice(PROVIDERS),
                    visit_type=random.choice(VISIT_TYPES),
                    visit_date=_random_date(six_months_ago, today),
                    summary=random.choice([
                        "Routine check-up, all vitals normal",
                        "Patient reports improvement",
                        "Adjusted medication dosage",
                        "Discussed treatment plan",
                        None,
                    ]),
                    diagnosis=random.choice(DIAGNOSES),
                    follow_up_needed=random.choice([True, False]),
                ))

            # Immunizations (0-3 per patient)
            for _ in range(random.randint(0, 3)):
                vaccine, max_dose = random.choice(VACCINES)
                session.add(Immunization(
                    patient_id=patient.id,
                    vaccine_name=vaccine,
                    date_administered=_random_date(six_months_ago, today),
                    administered_by=random.choice(PROVIDERS),
                    dose_number=random.randint(1, max_dose),
                    lot_number=f"LOT-{random.randint(10000, 99999)}",
                    next_due_date=_random_date(today, today + datetime.timedelta(days=365)) if random.random() > 0.5 else None,
                    notes=random.choice([None, "No adverse reaction", "Mild soreness at injection site"]),
                ))

            # Prescriptions (0-2 per patient)
            for _ in range(random.randint(0, 2)):
                ph_name, ph_street = random.choice(PHARMACIES)
                session.add(Prescription(
                    patient_id=patient.id,
                    medication_id=random.choice(med_ids),
                    dosage=random.choice(["5mg", "10mg", "20mg", "25mg", "50mg", "100mg", "250mg", "500mg"]),
                    frequency=random.choice(["Once daily", "Twice daily", "Three times daily", "As needed"]),
                    quantity=random.choice([30, 60, 90]),
                    duration=random.choice(["30 days", "60 days", "90 days", None]),
                    pharmacy_name=ph_name,
                    pharmacy_address=f"{ph_street}, {city}, {state} {zip_code}",
                    pharmacy_lat=round(random.uniform(25.0, 48.0), 6),
                    pharmacy_lng=round(random.uniform(-122.0, -73.0), 6),
                    prescribed_at=_random_datetime(six_months_ago, today),
                    notes=random.choice([None, "Take with food", "Avoid alcohol", "Monitor blood pressure"]),
                ))

            patients_created += 1

        session.commit()
        return {"message": "Database seeded successfully", "patients_created": patients_created}
