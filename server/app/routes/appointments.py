from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Appointment, Patient
from app.schemas import (
    AppointmentResponse,
    CreateAppointmentRequest,
    EditAppointmentRequest,
)

router = APIRouter()


@router.get("/getAppointments/{patient_id}", response_model=list[AppointmentResponse])
def get_appointments(patient_id: UUID, session: Session = Depends(get_session)):
    stmt = (
        select(Appointment)
        .where(Appointment.patient_id == patient_id)
        .order_by(Appointment.date_time.desc())
    )
    return session.exec(stmt).all()


@router.post("/createAppointment/{patient_id}", response_model=AppointmentResponse, status_code=201)
def create_appointment(
    patient_id: UUID,
    data: CreateAppointmentRequest,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    appointment = Appointment(patient_id=patient_id, **data.model_dump())
    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    return appointment


@router.patch("/editAppointment/{id}", response_model=AppointmentResponse)
def edit_appointment(
    id: UUID,
    data: EditAppointmentRequest,
    session: Session = Depends(get_session),
):
    appointment = session.get(Appointment, id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.sqlmodel_update(data.model_dump(exclude_unset=True))
    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    return appointment
