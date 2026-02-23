from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlmodel import Session, func, select

from app.database import get_session
from app.models import Patient, StatusHistory
from app.schemas import (
    ActivityItem,
    CareGapItem,
    CareGapsResponse,
    NewPatientsDataPoint,
    NewPatientsTrendResponse,
    RecentActivityResponse,
    RecentAppointmentItem,
    RecentAppointmentsResponse,
    StatsOverviewResponse,
    StatsTrendsResponse,
    StatusCount,
    TopMedicationItem,
    TopMedicationsResponse,
    TrendDataPoint,
)

router = APIRouter()


@router.get("/getStatsOverview", response_model=StatsOverviewResponse)
def get_stats_overview(session: Session = Depends(get_session)):
    stmt = (
        select(Patient.status, func.count())
        .group_by(Patient.status)
    )
    rows = session.exec(stmt).all()

    status_counts = [StatusCount(status=row[0], count=row[1]) for row in rows]
    total = sum(sc.count for sc in status_counts)

    return StatsOverviewResponse(status_counts=status_counts, total_patients=total)


@router.get("/getStatsTrends", response_model=StatsTrendsResponse)
def get_stats_trends(session: Session = Depends(get_session)):
    # Raw SQL for DATE_TRUNC pivot — cleaner than SQLModel for aggregation
    query = text("""
        SELECT
            TO_CHAR(DATE_TRUNC('month', changed_at), 'YYYY-MM') AS period,
            new_status,
            COUNT(*) AS cnt
        FROM status_history
        GROUP BY period, new_status
        ORDER BY period
    """)
    rows = session.exec(query).all()

    # Pivot into TrendDataPoint per period
    periods: dict[str, TrendDataPoint] = {}
    for period, new_status, cnt in rows:
        if period not in periods:
            periods[period] = TrendDataPoint(period=period)
        point = periods[period]
        status_lower = new_status.lower()
        if status_lower == "inquiry":
            point.inquiry = cnt
        elif status_lower == "onboarding":
            point.onboarding = cnt
        elif status_lower == "active":
            point.active = cnt
        elif status_lower == "churned":
            point.churned = cnt

    return StatsTrendsResponse(trends=list(periods.values()))


@router.get("/getRecentAppointments", response_model=RecentAppointmentsResponse)
def get_recent_appointments(
    month: str | None = None,
    session: Session = Depends(get_session),
):
    if month:
        # Calendar mode: all appointments for the given month (any status)
        upcoming_query = text("""
            SELECT
                a.id, a.patient_id,
                p.last_name || ', ' || p.first_name AS patient_name,
                a.provider_name, a.appointment_type, a.date_time,
                a.duration_minutes, a.status
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE TO_CHAR(a.date_time, 'YYYY-MM') = :month
            ORDER BY a.date_time ASC
        """)
        upcoming_rows = session.exec(upcoming_query, params={"month": month}).all()
    else:
        # Default: next 10 upcoming scheduled
        upcoming_query = text("""
            SELECT
                a.id, a.patient_id,
                p.last_name || ', ' || p.first_name AS patient_name,
                a.provider_name, a.appointment_type, a.date_time,
                a.duration_minutes, a.status
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.date_time >= NOW() AND a.status = 'Scheduled'
            ORDER BY a.date_time ASC
            LIMIT 10
        """)
        upcoming_rows = session.exec(upcoming_query).all()

    upcoming = [
        RecentAppointmentItem(
            id=row[0],
            patient_id=row[1],
            patient_name=row[2],
            provider_name=row[3],
            appointment_type=row[4],
            date_time=row[5],
            duration_minutes=row[6],
            status=row[7],
        )
        for row in upcoming_rows
    ]

    # Summary counts by status
    count_query = text("""
        SELECT status, COUNT(*) AS cnt
        FROM appointments
        GROUP BY status
    """)
    count_rows = session.exec(count_query).all()
    counts = {row[0]: row[1] for row in count_rows}

    return RecentAppointmentsResponse(
        upcoming=upcoming,
        total_scheduled=counts.get("Scheduled", 0),
        total_completed=counts.get("Completed", 0),
        total_cancelled=counts.get("Cancelled", 0),
        total_no_show=counts.get("No-Show", 0),
    )


@router.get("/getCareGaps", response_model=CareGapsResponse)
def get_care_gaps(session: Session = Depends(get_session)):
    query = text("""
        SELECT
            v.patient_id,
            p.last_name || ', ' || p.first_name AS patient_name,
            v.visit_date,
            v.diagnosis,
            CURRENT_DATE - v.visit_date AS days_since_visit
        FROM visits v
        JOIN patients p ON v.patient_id = p.id
        WHERE v.follow_up_needed = true
          AND NOT EXISTS (
              SELECT 1 FROM appointments a
              WHERE a.patient_id = v.patient_id
                AND a.status = 'Scheduled'
                AND a.date_time >= NOW()
          )
        ORDER BY days_since_visit DESC
        LIMIT 10
    """)
    rows = session.exec(query).all()

    items = [
        CareGapItem(
            patient_id=row[0],
            patient_name=row[1],
            visit_date=row[2],
            diagnosis=row[3],
            days_since_visit=row[4],
        )
        for row in rows
    ]

    # Total count for the badge
    count_query = text("""
        SELECT COUNT(*)
        FROM visits v
        WHERE v.follow_up_needed = true
          AND NOT EXISTS (
              SELECT 1 FROM appointments a
              WHERE a.patient_id = v.patient_id
                AND a.status = 'Scheduled'
                AND a.date_time >= NOW()
          )
    """)
    total = session.exec(count_query).scalar() or 0

    return CareGapsResponse(items=items, total_count=total)


@router.get("/getNewPatientsTrend", response_model=NewPatientsTrendResponse)
def get_new_patients_trend(session: Session = Depends(get_session)):
    query = text("""
        SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS period,
            COUNT(*) AS cnt
        FROM patients
        GROUP BY period
        ORDER BY period
    """)
    rows = session.exec(query).all()

    trends = [
        NewPatientsDataPoint(period=row[0], count=row[1])
        for row in rows
    ]

    return NewPatientsTrendResponse(trends=trends)


@router.get("/getTopMedications", response_model=TopMedicationsResponse)
def get_top_medications(session: Session = Depends(get_session)):
    query = text("""
        SELECT m.name, m.category, COUNT(*) AS cnt
        FROM prescriptions p
        JOIN medications m ON p.medication_id = m.id
        GROUP BY m.name, m.category
        ORDER BY cnt DESC
        LIMIT 10
    """)
    rows = session.exec(query).all()

    items = [
        TopMedicationItem(
            medication_name=row[0],
            category=row[1],
            count=row[2],
        )
        for row in rows
    ]

    return TopMedicationsResponse(items=items)


@router.get("/getRecentActivity", response_model=RecentActivityResponse)
def get_recent_activity(session: Session = Depends(get_session)):
    query = text("""
        (
            SELECT
                'appointment' AS event_type,
                CASE
                    WHEN a.status = 'Completed' THEN 'completed an appointment'
                    WHEN a.status = 'Cancelled' THEN 'cancelled an appointment'
                    ELSE 'scheduled an appointment'
                END AS description,
                a.provider_name AS actor_name,
                p.first_name || ' ' || p.last_name AS patient_name,
                a.patient_id,
                a.created_at AS timestamp,
                a.appointment_type AS detail
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
        )
        UNION ALL
        (
            SELECT
                'visit' AS event_type,
                'logged a visit' AS description,
                v.provider_name AS actor_name,
                p.first_name || ' ' || p.last_name AS patient_name,
                v.patient_id,
                v.created_at AS timestamp,
                v.visit_type AS detail
            FROM visits v
            JOIN patients p ON v.patient_id = p.id
        )
        UNION ALL
        (
            SELECT
                'prescription' AS event_type,
                'prescribed medication' AS description,
                'Provider' AS actor_name,
                p.first_name || ' ' || p.last_name AS patient_name,
                rx.patient_id,
                rx.prescribed_at AS timestamp,
                m.name AS detail
            FROM prescriptions rx
            JOIN patients p ON rx.patient_id = p.id
            JOIN medications m ON rx.medication_id = m.id
        )
        UNION ALL
        (
            SELECT
                'status_change' AS event_type,
                'status changed from ' || COALESCE(sh.old_status, 'New') || ' to ' || sh.new_status AS description,
                'System' AS actor_name,
                p.first_name || ' ' || p.last_name AS patient_name,
                sh.patient_id,
                sh.changed_at AS timestamp,
                sh.new_status AS detail
            FROM status_history sh
            JOIN patients p ON sh.patient_id = p.id
        )
        UNION ALL
        (
            SELECT
                'new_patient' AS event_type,
                'new patient registered' AS description,
                'System' AS actor_name,
                p.first_name || ' ' || p.last_name AS patient_name,
                p.id AS patient_id,
                p.created_at AS timestamp,
                NULL AS detail
            FROM patients p
        )
        ORDER BY timestamp DESC
        LIMIT 20
    """)
    rows = session.exec(query).all()

    items = [
        ActivityItem(
            event_type=row[0],
            description=row[1],
            actor_name=row[2],
            patient_name=row[3],
            patient_id=row[4],
            timestamp=row[5],
            detail=row[6],
        )
        for row in rows
    ]

    return RecentActivityResponse(items=items)
