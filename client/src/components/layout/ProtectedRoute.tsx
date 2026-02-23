import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='flex min-h-dvh items-center justify-center'>
        <div className='space-y-4 w-64'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-4 w-48' />
          <Skeleton className='h-4 w-32' />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
