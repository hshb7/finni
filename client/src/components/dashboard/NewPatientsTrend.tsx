import { format, parse } from 'date-fns'
import { UserPlusIcon } from 'lucide-react'
import { useNewPatientsTrend } from '@/hooks/use-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { AreaChart, Area, XAxis, CartesianGrid } from 'recharts'

const chartConfig = {
  newPatients: {
    label: 'New Patients',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

function formatMonth(period: string): string {
  try {
    return format(parse(period, 'yyyy-MM', new Date()), 'MMM yyyy')
  } catch {
    return period
  }
}

export function NewPatientsTrend() {
  const { data, isLoading } = useNewPatientsTrend()

  const chartData = data?.trends.map((t) => ({
    label: formatMonth(t.period),
    newPatients: t.count,
  })) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Patients</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className='h-[300px] w-full' />
        ) : chartData.length === 0 ? (
          <div className='flex h-[300px] flex-col items-center justify-center gap-2'>
            <UserPlusIcon className='text-muted-foreground size-10' />
            <p className='text-muted-foreground text-sm'>No data yet</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className='max-h-[350px] w-full'>
            <AreaChart data={chartData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='label'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type='monotone'
                dataKey='newPatients'
                stroke='var(--color-newPatients)'
                fill='var(--color-newPatients)'
                fillOpacity={0.15}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
