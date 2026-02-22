from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Immunization, Patient
from app.schemas import (
    CreateImmunizationRequest,
    EditImmunizationRequest,
    ImmunizationResponse,
)

router = APIRouter()


@router.get("/getImmunizations/{patient_id}", response_model=list[ImmunizationResponse])
def get_immunizations(patient_id: UUID, session: Session = Depends(get_session)):
    stmt = (
        select(Immunization)
        .where(Immunization.patient_id == patient_id)
        .order_by(Immunization.date_administered.desc())
    )
    return session.exec(stmt).all()


@router.post("/createImmunization/{patient_id}", response_model=ImmunizationResponse, status_code=201)
def create_immunization(
    patient_id: UUID,
    data: CreateImmunizationRequest,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    immunization = Immunization(patient_id=patient_id, **data.model_dump())
    session.add(immunization)
    session.commit()
    session.refresh(immunization)
    return immunization


@router.patch("/editImmunization/{id}", response_model=ImmunizationResponse)
def edit_immunization(
    id: UUID,
    data: EditImmunizationRequest,
    session: Session = Depends(get_session),
):
    immunization = session.get(Immunization, id)
    if not immunization:
        raise HTTPException(status_code=404, detail="Immunization not found")

    immunization.sqlmodel_update(data.model_dump(exclude_unset=True))
    session.add(immunization)
    session.commit()
    session.refresh(immunization)
    return immunization
