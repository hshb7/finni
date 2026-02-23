import math
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import joinedload, selectinload
from sqlmodel import Session, col, func, select

from app.database import get_session
from app.models import (
    EmergencyContact,
    InsuranceInfo,
    MedicalInfo,
    Patient,
    PreferredPharmacy,
    StatusHistory,
)
from app.schemas import (
    CreatePatientRequest,
    EditContactsRequest,
    EditDemographicsRequest,
    EditInsuranceRequest,
    EditMedicalRequest,
    EditPharmacyRequest,
    EditStatusRequest,
    EmergencyContactResponse,
    InsuranceInfoResponse,
    MedicalInfoResponse,
    PatientDetailResponse,
    PatientListResponse,
    PatientResponse,
    PreferredPharmacyResponse,
)

router = APIRouter()

ALLOWED_SORT_COLUMNS = {
    "created_at",
    "first_name",
    "last_name",
    "date_of_birth",
    "status",
    "city",
    "state",
}


@router.get("/getPatients", response_model=PatientListResponse)
def get_patients(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    session: Session = Depends(get_session),
):
    if sort_by not in ALLOWED_SORT_COLUMNS:
        raise HTTPException(status_code=400, detail=f"Invalid sort_by column: {sort_by}")

    # Base query
    base = select(Patient)
    count_q = select(func.count()).select_from(Patient)

    # Filters
    if status:
        base = base.where(Patient.status == status)
        count_q = count_q.where(Patient.status == status)

    if search:
        pattern = f"%{search}%"
        search_filter = col(Patient.first_name).ilike(pattern) | col(Patient.last_name).ilike(pattern)
        base = base.where(search_filter)
        count_q = count_q.where(search_filter)

    # Total count
    total = session.exec(count_q).one()

    # Sort
    sort_col = getattr(Patient, sort_by)
    order = sort_col.desc() if sort_order == "desc" else sort_col.asc()
    base = base.order_by(order)

    # Paginate
    offset = (page - 1) * page_size
    base = base.offset(offset).limit(page_size)

    items = session.exec(base).all()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return PatientListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/getPatient/{id}", response_model=PatientDetailResponse)
def get_patient(id: UUID, session: Session = Depends(get_session)):
    stmt = (
        select(Patient)
        .where(Patient.id == id)
        .options(
            # 1:1 — JOIN into the main query (no extra round trips)
            joinedload(Patient.insurance_info),
            joinedload(Patient.medical_info),
            joinedload(Patient.preferred_pharmacy),
            # 1:many — separate SELECT IN queries
            selectinload(Patient.emergency_contacts),
            selectinload(Patient.appointments),
            selectinload(Patient.visits),
            selectinload(Patient.immunizations),
            selectinload(Patient.prescriptions),
            selectinload(Patient.status_history),
        )
    )
    patient = session.exec(stmt).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("/createPatient", response_model=PatientResponse, status_code=201)
def create_patient(
    data: CreatePatientRequest,
    session: Session = Depends(get_session),
):
    patient_data = data.model_dump(exclude={"emergency_contacts", "insurance", "medical"})
    patient = Patient(**patient_data)
    session.add(patient)
    session.flush()  # get patient.id for child records

    if data.emergency_contacts:
        for contact_data in data.emergency_contacts:
            contact = EmergencyContact(patient_id=patient.id, **contact_data.model_dump())
            session.add(contact)

    if data.insurance:
        insurance = InsuranceInfo(patient_id=patient.id, **data.insurance.model_dump())
        session.add(insurance)

    if data.medical:
        medical = MedicalInfo(patient_id=patient.id, **data.medical.model_dump())
        session.add(medical)

    # Auto-log initial status
    history = StatusHistory(
        patient_id=patient.id,
        old_status=None,
        new_status="Inquiry",
    )
    session.add(history)

    session.commit()
    session.refresh(patient)
    return patient


@router.patch("/editDemographics/{id}", response_model=PatientResponse)
def edit_demographics(
    id: UUID,
    data: EditDemographicsRequest,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient.sqlmodel_update(data.model_dump(exclude_unset=True))
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient


@router.patch("/editStatus/{id}", response_model=PatientResponse)
def edit_status(
    id: UUID,
    data: EditStatusRequest,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if data.status != patient.status:
        history = StatusHistory(
            patient_id=patient.id,
            old_status=patient.status,
            new_status=data.status,
        )
        session.add(history)

    update_fields = data.model_dump(exclude_unset=True)
    patient.sqlmodel_update(update_fields)
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient


@router.put("/editContacts/{id}", response_model=list[EmergencyContactResponse])
def edit_contacts(
    id: UUID,
    data: EditContactsRequest,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Delete existing contacts
    existing = session.exec(
        select(EmergencyContact).where(EmergencyContact.patient_id == id)
    ).all()
    for contact in existing:
        session.delete(contact)

    # Insert new contacts
    new_contacts = []
    for contact_data in data.contacts:
        contact = EmergencyContact(patient_id=id, **contact_data.model_dump())
        session.add(contact)
        new_contacts.append(contact)

    session.commit()
    for contact in new_contacts:
        session.refresh(contact)
    return new_contacts


@router.put("/editInsurance/{id}", response_model=InsuranceInfoResponse)
def edit_insurance(
    id: UUID,
    data: EditInsuranceRequest,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    existing = session.exec(
        select(InsuranceInfo).where(InsuranceInfo.patient_id == id)
    ).first()

    if existing:
        existing.sqlmodel_update(data.model_dump())
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    else:
        insurance = InsuranceInfo(patient_id=id, **data.model_dump())
        session.add(insurance)
        session.commit()
        session.refresh(insurance)
        return insurance


@router.put("/editMedical/{id}", response_model=MedicalInfoResponse)
def edit_medical(
    id: UUID,
    data: EditMedicalRequest,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    existing = session.exec(
        select(MedicalInfo).where(MedicalInfo.patient_id == id)
    ).first()

    if existing:
        existing.sqlmodel_update(data.model_dump())
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    else:
        medical = MedicalInfo(patient_id=id, **data.model_dump())
        session.add(medical)
        session.commit()
        session.refresh(medical)
        return medical


@router.put("/editPharmacy/{id}", response_model=PreferredPharmacyResponse)
def edit_pharmacy(
    id: UUID,
    data: EditPharmacyRequest,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    existing = session.exec(
        select(PreferredPharmacy).where(PreferredPharmacy.patient_id == id)
    ).first()

    if existing:
        existing.sqlmodel_update(data.model_dump())
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    else:
        pharmacy = PreferredPharmacy(patient_id=id, **data.model_dump())
        session.add(pharmacy)
        session.commit()
        session.refresh(pharmacy)
        return pharmacy
