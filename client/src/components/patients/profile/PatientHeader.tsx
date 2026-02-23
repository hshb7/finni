import { Link } from 'react-router'
import { ArrowLeft, Pill } from 'lucide-react'
import { differenceInYears } from 'date-fns'
import type { PatientDetail } from '@/lib/types'
import { getInitials } from '@/lib/utils'
import { StatusBadge } from '@/components/patients/StatusBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface PatientHeaderProps {
  patient: PatientDetail
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const age = differenceInYears(new Date(), new Date(patient.date_of_birth))
  const name = `${patient.first_name} ${patient.last_name}`

  return (
    <div className='flex items-center gap-3'>
      <Button variant='ghost' size='icon-sm' asChild>
        <Link to='/'>
          <ArrowLeft />
        </Link>
      </Button>
      <Avatar className='size-10 avatar-pfp'>
        <AvatarImage src={patient.avatar_url ?? undefined} alt={name} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <h1 className='text-2xl font-bold'>{name}</h1>
      <StatusBadge status={patient.status} />
      <span className='text-muted-foreground'>
        {age}y {patient.sex}
      </span>
      <div className='ml-auto'>
        <Button variant='outline' size='sm' asChild>
          <Link to={`/patients/${patient.id}/prescribe`}>
            <Pill />
            Create Prescription
          </Link>
        </Button>
      </div>
    </div>
  )
}
