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

    # Places API (New) — POST endpoint
    url = "https://places.googleapis.com/v1/places:searchNearby"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": (
            "places.displayName,"
            "places.formattedAddress,"
            "places.location,"
            "places.rating,"
            "places.currentOpeningHours"
        ),
    }
    body = {
        "includedPrimaryTypes": ["pharmacy"],
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": float(radius),
            }
        },
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=body, headers=headers, timeout=10.0)

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Google Places API request failed")

    data = response.json()
    results = []
    for place in data.get("places", []):
        location = place.get("location", {})
        opening_hours = place.get("currentOpeningHours", {})
        display_name = place.get("displayName", {})
        results.append(
            PharmacyResult(
                name=display_name.get("text", ""),
                address=place.get("formattedAddress", ""),
                lat=location.get("latitude", 0),
                lng=location.get("longitude", 0),
                rating=place.get("rating"),
                open_now=opening_hours.get("openNow"),
            )
        )

    return PharmacySearchResponse(results=results)
