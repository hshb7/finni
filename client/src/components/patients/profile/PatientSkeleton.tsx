import { Skeleton } from '@/components/ui/skeleton'

export function PatientSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header skeleton */}
      <div className='flex items-center gap-3'>
        <Skeleton className='h-8 w-8 rounded-md' />
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-5 w-20' />
        <Skeleton className='h-5 w-16' />
      </div>

      {/* Tabs skeleton */}
      <Skeleton className='h-9 w-96' />

      {/* Two-column grid with skeleton cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Left column cards */}
        <div className='space-y-6'>
          <div className='rounded-xl border bg-card p-6 space-y-4'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-5/6' />
          </div>
          <div className='rounded-xl border bg-card p-6 space-y-4'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        </div>

        {/* Right column cards */}
        <div className='space-y-6'>
          <div className='rounded-xl border bg-card p-6 space-y-4'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-4/5' />
            <Skeleton className='h-4 w-3/4' />
          </div>
          <div className='rounded-xl border bg-card p-6 space-y-4'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-1/2' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        </div>
      </div>
    </div>
  )
}
