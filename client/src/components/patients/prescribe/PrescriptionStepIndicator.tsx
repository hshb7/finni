import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

const STEPS = [
  { label: 'Medication' },
  { label: 'Pharmacy' },
  { label: 'Confirm' },
]

interface PrescriptionStepIndicatorProps {
  currentStep: number
}

export function PrescriptionStepIndicator({ currentStep }: PrescriptionStepIndicatorProps) {
  const totalSteps = STEPS.length
  const progressValue = (currentStep / (totalSteps - 1)) * 100

  return (
    <div className='space-y-3'>
      <Progress value={progressValue} className='h-2' />
      <div className='flex justify-between'>
        {STEPS.map((step, index) => {
          const isCurrent = index === currentStep
          const isCompleted = index < currentStep

          return (
            <div key={step.label} className='flex flex-col items-center gap-1.5'>
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground scale-110',
                  !isCurrent && !isCompleted && 'bg-muted text-muted-foreground',
                )}
              >
                {isCompleted ? <Check className='size-4' /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isCurrent && 'text-primary',
                  isCompleted && 'text-foreground',
                  !isCurrent && !isCompleted && 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
