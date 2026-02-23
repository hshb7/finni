const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

interface AddressFields {
  street: string
  city: string
  state: string
  zip_code: string
}

interface Coordinates {
  lat: number
  lng: number
}

export async function geocodeAddress(address: AddressFields): Promise<Coordinates | null> {
  if (!MAPBOX_TOKEN) return null

  const query = `${address.street}, ${address.city}, ${address.state} ${address.zip_code}`
  const encoded = encodeURIComponent(query)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&country=us&limit=1`

  try {
    const res = await fetch(url)
    if (!res.ok) return null

    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return null

    // Mapbox returns [lng, lat] (GeoJSON order)
    const [lng, lat] = feature.center
    return { lat, lng }
  } catch {
    return null
  }
}
