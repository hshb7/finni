import { forwardRef } from 'react'
import { Star, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PharmacyResult } from '@/lib/types'

interface PharmacyListItemProps {
  pharmacy: PharmacyResult
  isSelected: boolean
  onClick: () => void
}

export const PharmacyListItem = forwardRef<HTMLButtonElement, PharmacyListItemProps>(
  ({ pharmacy, isSelected, onClick }, ref) => {
    return (
      <button
        ref={ref}
        type='button'
        onClick={onClick}
        className={cn(
          'w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent/50',
          isSelected && 'ring-2 ring-primary border-primary',
        )}
      >
        <div className='flex items-start gap-2'>
          <MapPin className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-medium'>{pharmacy.name}</p>
            <p className='text-muted-foreground truncate text-xs'>{pharmacy.address}</p>
            <div className='mt-1 flex items-center gap-3'>
              {pharmacy.rating != null && (
                <span className='flex items-center gap-1 text-xs'>
                  <Star className='size-3 fill-amber-400 text-amber-400' />
                  {pharmacy.rating.toFixed(1)}
                </span>
              )}
              {pharmacy.open_now != null && (
                <span className='flex items-center gap-1 text-xs'>
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      pharmacy.open_now ? 'bg-status-active' : 'bg-status-churned',
                    )}
                  />
                  <span className={pharmacy.open_now ? 'text-status-active' : 'text-status-churned'}>
                    {pharmacy.open_now ? 'Open' : 'Closed'}
                  </span>
                </span>
              )}
              {pharmacy.distance != null && (
                <span className='text-muted-foreground text-xs'>
                  {pharmacy.distance.toFixed(1)} mi
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    )
  },
)

PharmacyListItem.displayName = 'PharmacyListItem'
