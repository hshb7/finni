import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { SaveIcon, MoonIcon, SunIcon } from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { settingsSchema } from '@/lib/schemas'
import type { SettingsValues } from '@/lib/schemas'
import { applyTheme } from '@/lib/theme'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const THEMES = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: null },
] as const

const Settings = () => {
  const { user, settings, refreshSettings } = useAuth()
  const [isSaving, setIsSaving] = useState(false)

  const { handleSubmit, setValue, watch, reset, formState: { isDirty } } = useForm<SettingsValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      theme: 'system',
      notifications_enabled: true,
      page_size: 10,
      date_format: 'MM/DD/YYYY',
    },
  })

  const currentTheme = watch('theme')
  const notificationsEnabled = watch('notifications_enabled')

  useEffect(() => {
    if (settings) {
      reset({
        theme: settings.theme,
        notifications_enabled: settings.notifications_enabled,
        page_size: settings.page_size,
        date_format: settings.date_format as SettingsValues['date_format'],
      })
    }
  }, [settings, reset])

  const onSubmit = async (values: SettingsValues) => {
    if (!user) return
    setIsSaving(true)
    const { error } = await supabase
      .from('user_settings')
      .update({
        theme: values.theme,
        notifications_enabled: values.notifications_enabled,
        page_size: values.page_size,
        date_format: values.date_format,
        updated_at: new Date().toISOString(),
      })
      .eq('auth_user_id', user.id)
    setIsSaving(false)

    if (error) {
      toast.error('Failed to save settings')
      return
    }

    applyTheme(values.theme)
    localStorage.setItem('theme', values.theme)
    toast.success('Settings saved')
    await refreshSettings()
  }

  return (
    <div className='mx-auto max-w-2xl space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Settings</h1>
        <p className='text-muted-foreground'>Manage your application preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-3 gap-3'>
              {THEMES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type='button'
                  onClick={() => setValue('theme', value, { shouldDirty: true })}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    currentTheme === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {Icon ? <Icon className='size-5' /> : <span className='text-sm'>Auto</span>}
                  <span className='text-sm font-medium'>{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div>
                <Label htmlFor='notifications'>Enable notifications</Label>
                <p className='text-muted-foreground text-sm'>Receive alerts for appointments and care gaps</p>
              </div>
              <Switch
                id='notifications'
                checked={notificationsEnabled}
                onCheckedChange={v => setValue('notifications_enabled', v, { shouldDirty: true })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display</CardTitle>
            <CardDescription>Customize how data is shown</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='page_size'>Patients per page</Label>
                <Select
                  defaultValue={String(settings?.page_size ?? 10)}
                  onValueChange={v => setValue('page_size', Number(v) as 10 | 20 | 50, { shouldDirty: true })}
                >
                  <SelectTrigger id='page_size'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='20'>20</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='date_format'>Date format</Label>
                <Select
                  defaultValue={settings?.date_format ?? 'MM/DD/YYYY'}
                  onValueChange={v => setValue('date_format', v as SettingsValues['date_format'], { shouldDirty: true })}
                >
                  <SelectTrigger id='date_format'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='MM/DD/YYYY'>MM/DD/YYYY</SelectItem>
                    <SelectItem value='DD/MM/YYYY'>DD/MM/YYYY</SelectItem>
                    <SelectItem value='YYYY-MM-DD'>YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button type='submit' disabled={isSaving || !isDirty}>
            <SaveIcon className='size-4' />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Settings
