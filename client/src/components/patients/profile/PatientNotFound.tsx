import { Link } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PatientNotFound() {
  return (
    <div className='flex items-center justify-center py-20'>
      <Card className='w-full max-w-md'>
        <CardContent className='flex flex-col items-center text-center space-y-4'>
          <AlertCircle className='size-12 text-muted-foreground' />
          <h2 className='text-xl font-semibold'>Patient Not Found</h2>
          <p className='text-sm text-muted-foreground'>
            The patient you are looking for does not exist or may have been removed.
          </p>
          <Button asChild>
            <Link to='/'>Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
