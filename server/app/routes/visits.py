from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Patient, Visit
from app.schemas import CreateVisitRequest, EditVisitRequest, VisitResponse

router = APIRouter()


@router.get("/getVisits/{patient_id}", response_model=list[VisitResponse])
def get_visits(patient_id: UUID, session: Session = Depends(get_session)):
    stmt = (
        select(Visit)
        .where(Visit.patient_id == patient_id)
        .order_by(Visit.visit_date.desc())
    )
    return session.exec(stmt).all()


@router.post("/createVisit/{patient_id}", response_model=VisitResponse, status_code=201)
def create_visit(
    patient_id: UUID,
    data: CreateVisitRequest,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    visit = Visit(patient_id=patient_id, **data.model_dump())
    session.add(visit)
    session.commit()
    session.refresh(visit)
    return visit


@router.patch("/editVisit/{id}", response_model=VisitResponse)
def edit_visit(
    id: UUID,
    data: EditVisitRequest,
    session: Session = Depends(get_session),
):
    visit = session.get(Visit, id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    visit.sqlmodel_update(data.model_dump(exclude_unset=True))
    session.add(visit)
    session.commit()
    session.refresh(visit)
    return visit
