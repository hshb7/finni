import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase'
import { loginSchema } from '@/lib/schemas'
import type { LoginValues } from '@/lib/schemas'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import LogoSvg from '@/assets/svg/logo'

const Login = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    setIsSubmitting(false)

    if (error) {
      toast.error(error.message)
      return
    }
    navigate('/')
  }

  return (
    <div className='bg-muted flex min-h-dvh items-center justify-center p-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='items-center text-center'>
          <LogoSvg className='size-12 mb-2' />
          <CardTitle className='text-2xl'>Finni Health</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' placeholder='you@example.com' {...register('email')} />
              {errors.email && <p className='text-destructive text-sm'>{errors.email.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' placeholder='Enter your password' {...register('password')} />
              {errors.password && <p className='text-destructive text-sm'>{errors.password.message}</p>}
            </div>
            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className='text-muted-foreground text-center text-sm'>
              Don&apos;t have an account?{' '}
              <Link to='/register' className='text-primary underline-offset-4 hover:underline'>
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
