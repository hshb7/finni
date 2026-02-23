import { useStatsOverview, useStatsTrends } from '@/hooks/use-stats'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentAppointments } from '@/components/dashboard/RecentAppointments'
import { CareGaps } from '@/components/dashboard/CareGaps'
import { NewPatientsTrend } from '@/components/dashboard/NewPatientsTrend'
import { TopMedications } from '@/components/dashboard/TopMedications'
import { TrendsAreaChart } from '@/components/dashboard/TrendsAreaChart'
import { PatientTable } from '@/components/dashboard/PatientTable'

const Dashboard = () => {
  const { data: overview, isLoading: overviewLoading } = useStatsOverview()
  const { data: trends, isLoading: trendsLoading } = useStatsTrends()

  return (
    <div className='space-y-6'>
      <StatsCards data={overview} isLoading={overviewLoading} />
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <RecentAppointments />
        <CareGaps />
      </div>
      <NewPatientsTrend />
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <TopMedications />
        <TrendsAreaChart data={trends} isLoading={trendsLoading} />
      </div>
      <PatientTable />
    </div>
  )
}

export default Dashboard
