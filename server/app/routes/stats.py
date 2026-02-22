from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlmodel import Session, func, select

from app.database import get_session
from app.models import Patient, StatusHistory
from app.schemas import (
    StatsOverviewResponse,
    StatsTrendsResponse,
    StatusCount,
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
