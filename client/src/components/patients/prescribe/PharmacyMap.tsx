import { useEffect, useRef, useCallback, useState } from 'react'
import Map, { Marker, type MapRef } from 'react-map-gl/mapbox'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PharmacyResult } from '@/lib/types'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

interface PharmacyMapProps {
  patientLocation: { lat: number; lng: number }
  pharmacies: PharmacyResult[]
  selectedIndex: number | null
  onSelectPharmacy: (index: number) => void
}

export function PharmacyMap({
  patientLocation,
  pharmacies,
  selectedIndex,
  onSelectPharmacy,
}: PharmacyMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark'),
  )

  // Watch for dark mode class changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  // Fly to selected pharmacy
  useEffect(() => {
    if (selectedIndex == null || !pharmacies[selectedIndex] || !mapRef.current) return
    const p = pharmacies[selectedIndex]
    mapRef.current.flyTo({ center: [p.lng, p.lat], zoom: 15, duration: 800 })
  }, [selectedIndex, pharmacies])

  const handleMarkerClick = useCallback(
    (index: number) => {
      onSelectPharmacy(index)
    },
    [onSelectPharmacy],
  )

  const mapStyle = isDark
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/streets-v12'

  return (
    <div className='h-[300px] overflow-hidden rounded-lg border lg:h-[400px]'>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          latitude: patientLocation.lat,
          longitude: patientLocation.lng,
          zoom: 13,
        }}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Patient location — blue pulsing dot */}
        <Marker latitude={patientLocation.lat} longitude={patientLocation.lng}>
          <div className='relative flex items-center justify-center'>
            <span className='absolute size-6 animate-ping rounded-full bg-blue-400/30' />
            <span className='relative size-3 rounded-full border-2 border-white bg-blue-500 shadow' />
          </div>
        </Marker>

        {/* Pharmacy markers */}
        {pharmacies.map((p, i) => {
          const isSelected = i === selectedIndex
          return (
            <Marker
              key={`${p.lat}-${p.lng}-${i}`}
              latitude={p.lat}
              longitude={p.lng}
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                handleMarkerClick(i)
              }}
            >
              <MapPin
                className={cn(
                  'cursor-pointer drop-shadow-md transition-transform',
                  isSelected
                    ? 'size-8 -translate-y-2 text-primary fill-primary/20'
                    : 'size-5 text-muted-foreground fill-muted/50 hover:text-primary',
                )}
              />
            </Marker>
          )
        })}
      </Map>
    </div>
  )
}
