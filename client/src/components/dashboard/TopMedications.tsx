import { useTopMedications } from '@/hooks/use-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis } from 'recharts'

const chartConfig = {
  count: {
    label: 'Prescriptions',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

export function TopMedications() {
  const { data, isLoading } = useTopMedications()

  const chartData = data?.items.map((item) => ({
    name: item.medication_name,
    count: item.count,
    category: item.category,
  })) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Medications</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className='h-[300px] w-full' />
        ) : chartData.length === 0 ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            No prescriptions yet
          </p>
        ) : (
          <ChartContainer config={chartConfig} className='max-h-[350px] w-full'>
            <BarChart data={chartData} layout='vertical' accessibilityLayer>
              <XAxis type='number' tickLine={false} axisLine={false} />
              <YAxis
                type='category'
                dataKey='name'
                tickLine={false}
                axisLine={false}
                width={120}
                tickMargin={4}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => (
                      <span>
                        {value} prescriptions ({item.payload.category})
                      </span>
                    )}
                  />
                }
              />
              <Bar
                dataKey='count'
                fill='var(--color-count)'
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
