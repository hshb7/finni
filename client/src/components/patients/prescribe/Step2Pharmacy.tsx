import { useState, useMemo, useRef, useCallback } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { PrescriptionValues } from '@/lib/schemas'
import type { PharmacySearchParams } from '@/lib/types'
import { usePatient } from '@/hooks/use-patients'
import { useNearbyPharmacies } from '@/hooks/use-pharmacies'
import { geocodeAddress } from '@/lib/geocode'
import { Checkbox } from '@/components/ui/checkbox'
import { PharmacyListItem } from './PharmacyListItem'
import { PharmacyMap } from './PharmacyMap'

interface Step2PharmacyProps {
  form: UseFormReturn<PrescriptionValues>
  patientId: string
}

export function Step2Pharmacy({ form, patientId }: Step2PharmacyProps) {
  const { data: patient } = usePatient(patientId)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(() => {
    // Initialize from form values if they exist (e.g. going back then forward)
    return form.getValues('pharmacy_name') ? -1 : null
  })
  const listRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Geocode as a query instead of effect + setState
  const addressKey = patient
    ? `${patient.street}-${patient.city}-${patient.state}-${patient.zip_code}`
    : null

  const { data: coords, isLoading: geocoding, isError: geocodeError } = useQuery({
    queryKey: ['geocode', addressKey],
    queryFn: () =>
      geocodeAddress({
        street: patient!.street,
        city: patient!.city,
        state: patient!.state,
        zip_code: patient!.zip_code,
      }),
    enabled: !!patient,
    staleTime: Infinity,
    retry: false,
  })

  const searchParams: PharmacySearchParams | null = coords
    ? { lat: coords.lat, lng: coords.lng, radius: 5000 }
    : null
  const { data: pharmacyData, isLoading: loadingPharmacies } = useNearbyPharmacies(searchParams)
  const pharmacies = useMemo(() => pharmacyData?.results ?? [], [pharmacyData])

  // Resolve initial selectedIndex from form values once pharmacies load
  const resolvedIndex = useMemo(() => {
    if (selectedIndex !== -1) return selectedIndex
    const name = form.getValues('pharmacy_name')
    const address = form.getValues('pharmacy_address')
    if (!name || pharmacies.length === 0) return -1
    const idx = pharmacies.findIndex((p) => p.name === name && p.address === address)
    return idx >= 0 ? idx : null
  }, [selectedIndex, pharmacies, form])

  const handleSelect = useCallback(
    (index: number) => {
      setSelectedIndex(index)
      const p = pharmacies[index]
      form.setValue('pharmacy_name', p.name)
      form.setValue('pharmacy_address', p.address)
      form.setValue('pharmacy_lat', p.lat)
      form.setValue('pharmacy_lng', p.lng)
      form.clearErrors(['pharmacy_name', 'pharmacy_address', 'pharmacy_lat', 'pharmacy_lng'])
    },
    [pharmacies, form],
  )

  const handleMapSelect = useCallback(
    (index: number) => {
      handleSelect(index)
      listRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    },
    [handleSelect],
  )

  const saveAsPreferred = form.watch('save_as_preferred_pharmacy')

  // Loading states
  if (geocoding || !patient) {
    return (
      <div className='flex min-h-[200px] flex-col items-center justify-center gap-2'>
        <Loader2 className='size-6 animate-spin text-muted-foreground' />
        <p className='text-muted-foreground text-sm'>Locating patient address...</p>
      </div>
    )
  }

  if (geocodeError || (!geocoding && !coords)) {
    return (
      <div className='flex min-h-[200px] flex-col items-center justify-center gap-2'>
        <p className='text-destructive text-sm font-medium'>
          Could not geocode the patient&apos;s address.
        </p>
        <p className='text-muted-foreground text-xs'>
          {patient.street}, {patient.city}, {patient.state} {patient.zip_code}
        </p>
        <p className='text-muted-foreground text-xs'>
          Please verify the address on the patient profile.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]'>
        {/* Pharmacy List */}
        <div className='space-y-2'>
          <h3 className='text-sm font-semibold'>Nearby Pharmacies</h3>
          {loadingPharmacies ? (
            <div className='flex min-h-[200px] items-center justify-center'>
              <Loader2 className='size-5 animate-spin text-muted-foreground' />
            </div>
          ) : pharmacies.length === 0 ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              No pharmacies found nearby.
            </p>
          ) : (
            <div className='max-h-[400px] space-y-2 overflow-y-auto pr-1'>
              {pharmacies.map((p, i) => (
                <PharmacyListItem
                  key={`${p.lat}-${p.lng}-${i}`}
                  ref={(el) => { listRefs.current[i] = el }}
                  pharmacy={p}
                  isSelected={i === resolvedIndex}
                  onClick={() => handleSelect(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className='space-y-2'>
          <h3 className='text-sm font-semibold'>Map</h3>
          {coords && (
            <PharmacyMap
              patientLocation={coords}
              pharmacies={pharmacies}
              selectedIndex={resolvedIndex}
              onSelectPharmacy={handleMapSelect}
            />
          )}
        </div>
      </div>

      {/* Validation error */}
      {form.formState.errors.pharmacy_name && (
        <p className='text-destructive text-sm'>
          {form.formState.errors.pharmacy_name.message}
        </p>
      )}

      {/* Save as preferred checkbox */}
      <label className='flex items-center gap-2'>
        <Checkbox
          checked={saveAsPreferred ?? false}
          onCheckedChange={(checked) =>
            form.setValue('save_as_preferred_pharmacy', checked === true)
          }
        />
        <span className='text-sm'>Save as patient&apos;s preferred pharmacy</span>
      </label>
    </div>
  )
}
