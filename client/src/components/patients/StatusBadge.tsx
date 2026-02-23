import type { PatientStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

const statusDotColors: Record<PatientStatus, string> = {
  Active: 'bg-status-active',
  Inquiry: 'bg-status-inquiry',
  Onboarding: 'bg-status-onboarding',
  Churned: 'bg-status-churned',
}

const statusTextColors: Record<PatientStatus, string> = {
  Active: 'text-status-active',
  Inquiry: 'text-status-inquiry',
  Onboarding: 'text-status-onboarding',
  Churned: 'text-status-churned',
}

interface StatusBadgeProps {
  status: PatientStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('size-2 shrink-0 rounded-full', statusDotColors[status])} />
      <span className={cn('text-sm', statusTextColors[status])}>
        {status}
      </span>
    </span>
  )
}
