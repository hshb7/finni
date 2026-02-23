import { useQuery } from '@tanstack/react-query'
import { pharmacyKeys } from '@/lib/query-keys'
import * as api from '@/lib/api'
import type { PharmacySearchParams } from '@/lib/types'

export function useNearbyPharmacies(params: PharmacySearchParams | null) {
  return useQuery({
    queryKey: pharmacyKeys.search(params!),
    queryFn: () => api.getNearbyPharmacies(params!),
    enabled: !!params,
    staleTime: 5 * 60 * 1000,
  })
}
