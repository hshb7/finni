import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase'
import { registerSchema } from '@/lib/schemas'
import type { RegisterValues } from '@/lib/schemas'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import LogoSvg from '@/assets/svg/logo'

const Register = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register: reg, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(registerSchema) as any,
    defaultValues: { display_name: '', email: '', password: '', confirm_password: '' },
  })

  const onSubmit = async (values: RegisterValues) => {
    setIsSubmitting(true)
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { display_name: values.display_name } },
    })
    setIsSubmitting(false)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Account created successfully')
    navigate('/')
  }

  return (
    <div className='bg-muted flex min-h-dvh items-center justify-center p-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='items-center text-center'>
          <LogoSvg className='size-12 mb-2' />
          <CardTitle className='text-2xl'>Create Account</CardTitle>
          <CardDescription>Register for Finni Health</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='display_name'>Display Name</Label>
              <Input id='display_name' placeholder='Your name' {...reg('display_name')} />
              {errors.display_name && <p className='text-destructive text-sm'>{errors.display_name.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' placeholder='you@example.com' {...reg('email')} />
              {errors.email && <p className='text-destructive text-sm'>{errors.email.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' placeholder='At least 6 characters' {...reg('password')} />
              {errors.password && <p className='text-destructive text-sm'>{errors.password.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirm_password'>Confirm Password</Label>
              <Input id='confirm_password' type='password' placeholder='Repeat your password' {...reg('confirm_password')} />
              {errors.confirm_password && <p className='text-destructive text-sm'>{errors.confirm_password.message}</p>}
            </div>
            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
            <p className='text-muted-foreground text-center text-sm'>
              Already have an account?{' '}
              <Link to='/login' className='text-primary underline-offset-4 hover:underline'>
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register
