import { useQuery } from '@tanstack/react-query'
import { statsKeys } from '@/lib/query-keys'
import * as api from '@/lib/api'

export function useStatsOverview() {
  return useQuery({
    queryKey: statsKeys.overview(),
    queryFn: api.getStatsOverview,
  })
}

export function useStatsTrends() {
  return useQuery({
    queryKey: statsKeys.trends(),
    queryFn: api.getStatsTrends,
  })
}

export function useRecentAppointments(month?: string) {
  return useQuery({
    queryKey: statsKeys.recentAppointments(month),
    queryFn: () => api.getRecentAppointments(month),
  })
}

export function useCareGaps() {
  return useQuery({
    queryKey: statsKeys.careGaps(),
    queryFn: api.getCareGaps,
  })
}

export function useNewPatientsTrend() {
  return useQuery({
    queryKey: statsKeys.newPatientsTrend(),
    queryFn: api.getNewPatientsTrend,
  })
}

export function useTopMedications() {
  return useQuery({
    queryKey: statsKeys.topMedications(),
    queryFn: api.getTopMedications,
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: statsKeys.recentActivity(),
    queryFn: api.getRecentActivity,
  })
}
