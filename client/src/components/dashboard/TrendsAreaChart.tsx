import type { StatsTrends } from '@/lib/types'
import { format, parse } from 'date-fns'
import { TrendingUpIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { AreaChart, Area, XAxis, CartesianGrid } from 'recharts'

const chartConfig = {
  inquiry: { label: 'Inquiry', color: 'var(--chart-inquiry)' },
  onboarding: { label: 'Onboarding', color: 'var(--chart-onboarding)' },
  active: { label: 'Active', color: 'var(--chart-active)' },
  churned: { label: 'Churned', color: 'var(--chart-churned)' },
} satisfies ChartConfig

const statusKeys = ['inquiry', 'onboarding', 'active', 'churned'] as const

function formatMonth(period: string): string {
  try {
    return format(parse(period, 'yyyy-MM', new Date()), 'MMM yyyy')
  } catch {
    return period
  }
}

interface TrendsAreaChartProps {
  data: StatsTrends | undefined
  isLoading: boolean
}

export function TrendsAreaChart({ data, isLoading }: TrendsAreaChartProps) {
  const chartData = data?.trends.map((t) => ({
    ...t,
    label: formatMonth(t.period),
  })) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className='h-[300px] w-full' />
        ) : chartData.length === 0 ? (
          <div className='flex h-[300px] flex-col items-center justify-center gap-2'>
            <TrendingUpIcon className='text-muted-foreground size-10' />
            <p className='text-muted-foreground text-sm'>No trend data available</p>
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
              <ChartLegend content={<ChartLegendContent />} />
              {statusKeys.map((key) => (
                <Area
                  key={key}
                  type='monotone'
                  dataKey={key}
                  stroke={`var(--color-${key})`}
                  fill={`var(--color-${key})`}
                  fillOpacity={0.1}
                  stackId='a'
                />
              ))}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
