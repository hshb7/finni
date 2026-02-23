import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { SaveIcon, CheckIcon } from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { profileSchema } from '@/lib/schemas'
import type { ProfileValues } from '@/lib/schemas'
import { cn, getInitials } from '@/lib/utils'
import { AVATAR_OPTIONS } from '@/lib/constants'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ROLES = ['Staff', 'Administrator', 'Provider', 'Nurse'] as const

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [pendingAvatar, setPendingAvatar] = useState<string | null | undefined>(undefined)

  const selectedAvatar = pendingAvatar !== undefined ? pendingAvatar : (profile?.avatar_url ?? null)
  const avatarDirty = pendingAvatar !== undefined

  const { register, handleSubmit, setValue, reset, formState: { errors, isDirty } } = useForm<ProfileValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      display_name: '',
      role: 'Staff',
      phone: '',
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        display_name: profile.display_name,
        role: profile.role as ProfileValues['role'],
        phone: profile.phone ?? '',
      })
    }
  }, [profile, reset])

  const onSubmit = async (values: ProfileValues) => {
    if (!user) return
    setIsSaving(true)
    const { error } = await supabase
      .from('user_profiles')
      .update({
        display_name: values.display_name,
        role: values.role,
        phone: values.phone || null,
        avatar_url: selectedAvatar,
        updated_at: new Date().toISOString(),
      })
      .eq('auth_user_id', user.id)
    setIsSaving(false)

    if (error) {
      toast.error('Failed to update profile')
      return
    }
    toast.success('Profile updated')
    setPendingAvatar(undefined)
    await refreshProfile()
  }

  const initials = getInitials(profile?.display_name || user?.email || '')
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  const hasChanges = isDirty || avatarDirty

  return (
    <div className='mx-auto max-w-2xl space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>My Profile</h1>
        <p className='text-muted-foreground'>Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <Avatar className='size-16 avatar-pfp'>
              <AvatarImage src={selectedAvatar ?? undefined} alt={profile?.display_name ?? ''} />
              <AvatarFallback className='text-xl'>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile?.display_name || 'User'}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              {memberSince && (
                <p className='text-muted-foreground text-xs mt-1'>Member since {memberSince}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-3'>
              <Label>Avatar</Label>
              <div className='grid grid-cols-6 gap-3'>
                {AVATAR_OPTIONS.map(url => (
                  <button
                    key={url}
                    type='button'
                    onClick={() => setPendingAvatar(url)}
                    className={cn(
                      'relative rounded-full transition-all',
                      selectedAvatar === url
                        ? 'ring-primary ring-2 ring-offset-2 ring-offset-background'
                        : 'hover:ring-primary/50 hover:ring-2 hover:ring-offset-2 hover:ring-offset-background'
                    )}
                  >
                    <Avatar className='size-full avatar-pfp'>
                      <AvatarImage src={url} alt='Avatar option' />
                    </Avatar>
                    {selectedAvatar === url && (
                      <span className='bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full'>
                        <CheckIcon className='size-3' />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='display_name'>Display Name</Label>
                <Input id='display_name' {...register('display_name')} />
                {errors.display_name && <p className='text-destructive text-sm'>{errors.display_name.message}</p>}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' value={user?.email ?? ''} disabled className='bg-muted' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='role'>Role</Label>
                <Select
                  defaultValue={profile?.role || 'Staff'}
                  onValueChange={v => setValue('role', v as ProfileValues['role'], { shouldDirty: true })}
                >
                  <SelectTrigger id='role'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className='text-destructive text-sm'>{errors.role.message}</p>}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone</Label>
                <Input id='phone' placeholder='(555) 123-4567' {...register('phone')} />
              </div>
            </div>
            <div className='flex justify-end'>
              <Button type='submit' disabled={isSaving || !hasChanges}>
                <SaveIcon className='size-4' />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile
