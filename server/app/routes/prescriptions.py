from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload

from app.database import get_session
from app.models import Medication, Patient, PreferredPharmacy, Prescription
from app.schemas import (
    CreatePrescriptionRequest,
    MedicationResponse,
    PrescriptionResponse,
)

router = APIRouter()


@router.get("/getMedications", response_model=list[MedicationResponse])
def get_medications(session: Session = Depends(get_session)):
    stmt = select(Medication).order_by(Medication.name)
    return session.exec(stmt).all()


@router.get("/getPrescriptions/{patient_id}", response_model=list[PrescriptionResponse])
def get_prescriptions(patient_id: UUID, session: Session = Depends(get_session)):
    stmt = (
        select(Prescription)
        .where(Prescription.patient_id == patient_id)
        .options(selectinload(Prescription.medication))
        .order_by(Prescription.prescribed_at.desc())
    )
    return session.exec(stmt).all()


@router.post("/createPrescription/{patient_id}", response_model=PrescriptionResponse, status_code=201)
def create_prescription(
    patient_id: UUID,
    data: CreatePrescriptionRequest,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    medication = session.get(Medication, data.medication_id)
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")

    fields = data.model_dump(exclude={"save_as_preferred_pharmacy"})
    prescription = Prescription(patient_id=patient_id, **fields)
    session.add(prescription)

    if data.save_as_preferred_pharmacy:
        existing = session.exec(
            select(PreferredPharmacy).where(PreferredPharmacy.patient_id == patient_id)
        ).first()
        if existing:
            existing.name = data.pharmacy_name
            existing.address = data.pharmacy_address
            existing.lat = data.pharmacy_lat
            existing.lng = data.pharmacy_lng
            session.add(existing)
        else:
            pharmacy = PreferredPharmacy(
                patient_id=patient_id,
                name=data.pharmacy_name,
                address=data.pharmacy_address,
                lat=data.pharmacy_lat,
                lng=data.pharmacy_lng,
            )
            session.add(pharmacy)

    session.commit()
    session.refresh(prescription)
    # Eagerly load medication for response
    _ = prescription.medication
    return prescription
