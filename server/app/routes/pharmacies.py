import os

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.schemas import PharmacyResult, PharmacySearchResponse

router = APIRouter()

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")


@router.get("/getNearbyPharmacies", response_model=PharmacySearchResponse)
async def get_nearby_pharmacies(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: int = Query(default=8000),
):
    if not GOOGLE_PLACES_API_KEY:
        raise HTTPException(status_code=500, detail="Google Places API key not configured")

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": "pharmacy",
        "key": GOOGLE_PLACES_API_KEY,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10.0)

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Google Places API request failed")

    data = response.json()
    results = []
    for place in data.get("results", []):
        geometry = place.get("geometry", {}).get("location", {})
        opening_hours = place.get("opening_hours", {})
        results.append(
            PharmacyResult(
                name=place.get("name", ""),
                address=place.get("vicinity", ""),
                lat=geometry.get("lat", 0),
                lng=geometry.get("lng", 0),
                rating=place.get("rating"),
                open_now=opening_hours.get("open_now"),
            )
        )

    return PharmacySearchResponse(results=results)
