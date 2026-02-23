import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

import {
  CalendarIcon,
  ClipboardIcon,
  PillIcon,
  ArrowRightLeftIcon,
  UserPlusIcon,
  InboxIcon,
} from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'

import { useRecentActivity } from '@/hooks/use-stats'
import { formatRelativeTime } from '@/lib/format'
import { getInitials } from '@/lib/utils'
import type { ActivityItem } from '@/lib/types'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
}

const eventIcons: Record<ActivityItem['event_type'], typeof CalendarIcon> = {
  appointment: CalendarIcon,
  visit: ClipboardIcon,
  prescription: PillIcon,
  status_change: ArrowRightLeftIcon,
  new_patient: UserPlusIcon,
}

const statusColorMap: Record<string, string> = {
  Inquiry: 'bg-status-inquiry',
  Onboarding: 'bg-status-onboarding',
  Active: 'bg-status-active',
  Churned: 'bg-status-churned',
}

function SkeletonActivity() {
  return (
    <div className='space-y-0'>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i}>
          <div className='flex gap-4 px-4 py-3'>
            <Skeleton className='size-10 rounded-full shrink-0' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-56' />
              <Skeleton className='h-3 w-24' />
            </div>
          </div>
          {i < 5 && <Separator />}
        </div>
      ))}
    </div>
  )
}

function ActivityEntry({ item, onNavigate }: { item: ActivityItem; onNavigate: (id: string) => void }) {
  const Icon = eventIcons[item.event_type]

  return (
    <button
      type='button'
      className='flex w-full gap-4 px-4 py-3 text-left hover:bg-muted/50 transition-colors cursor-pointer'
      onClick={() => onNavigate(item.patient_id)}
    >
      <Avatar>
        <AvatarFallback>{getInitials(item.actor_name)}</AvatarFallback>
      </Avatar>
      <div className='flex w-full flex-col items-start gap-1'>
        <div className='text-muted-foreground flex flex-col items-start text-sm'>
          <p>
            <span className='text-foreground font-semibold'>{item.actor_name}</span>{' '}
            {item.description}
            {item.event_type !== 'status_change' && item.event_type !== 'new_patient' && (
              <span> for <span className='text-foreground font-medium'>{item.patient_name}</span></span>
            )}
            {item.event_type === 'new_patient' && (
              <span> &mdash; <span className='text-foreground font-medium'>{item.patient_name}</span></span>
            )}
          </p>
          <p>{formatRelativeTime(item.timestamp)}</p>
        </div>
        {item.detail && (
          <div className='flex items-center gap-2 text-xs'>
            <Icon className='text-muted-foreground size-3.5' />
            {item.event_type === 'status_change' ? (
              <span className='flex items-center gap-1.5'>
                <span className={`size-2 rounded-full ${statusColorMap[item.detail] ?? 'bg-muted-foreground'}`} />
                <span className='text-muted-foreground'>{item.detail}</span>
              </span>
            ) : (
              <span className='text-muted-foreground'>{item.detail}</span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}

const ActivityDialog = ({ defaultOpen = false, trigger }: Props) => {
  const navigate = useNavigate()
  const { data, isLoading } = useRecentActivity()
  const items = data?.items ?? []

  return (
    <Sheet defaultOpen={defaultOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className='gap-0 sm:max-w-112 [&>button]:top-2.75 [&>button>svg]:size-5'>
        <SheetHeader className='border-b py-2.25'>
          <SheetTitle className='text-lg leading-6'>Activity</SheetTitle>
          <SheetDescription hidden />
        </SheetHeader>

        <div className='overflow-y-auto'>
          {isLoading ? (
            <SkeletonActivity />
          ) : items.length === 0 ? (
            <div className='flex flex-col items-center gap-3 py-16 text-center'>
              <InboxIcon className='text-muted-foreground size-10' />
              <p className='text-muted-foreground text-sm'>No recent activity</p>
            </div>
          ) : (
            items.map((item, i) => (
              <div key={`${item.event_type}-${item.patient_id}-${item.timestamp}`}>
                <ActivityEntry item={item} onNavigate={(id) => navigate(`/patients/${id}`)} />
                {i < items.length - 1 && <Separator />}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default ActivityDialog
