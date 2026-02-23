import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CheckIcon } from 'lucide-react'
import type { PatientDetail } from '@/lib/types'
import { editDemographicsSchema } from '@/lib/schemas'
import type { EditDemographicsValues } from '@/lib/schemas'
import { SEX_OPTIONS, US_STATES, AVATAR_OPTIONS } from '@/lib/constants'
import { cn, getInitials } from '@/lib/utils'
import { useEditDemographics } from '@/hooks/use-patients'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

interface EditDemographicsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: PatientDetail
  patientId: string
}

export function EditDemographicsDialog({
  open,
  onOpenChange,
  patient,
  patientId,
}: EditDemographicsDialogProps) {
  const { mutate, isPending } = useEditDemographics()
  const [pendingAvatar, setPendingAvatar] = useState<string | null | undefined>(undefined)
  const selectedAvatar = pendingAvatar !== undefined ? pendingAvatar : (patient.avatar_url ?? null)

  const form = useForm<EditDemographicsValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editDemographicsSchema) as any,
    defaultValues: {
      first_name: patient.first_name,
      middle_name: patient.middle_name ?? '',
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth,
      sex: patient.sex,
      primary_language: patient.primary_language ?? '',
      email: patient.email ?? '',
      phone: patient.phone ?? '',
      street: patient.street,
      city: patient.city,
      state: patient.state,
      zip_code: patient.zip_code,
    },
  })

  useEffect(() => {
    if (open) {
      setPendingAvatar(undefined)
      form.reset({
        first_name: patient.first_name,
        middle_name: patient.middle_name ?? '',
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        sex: patient.sex,
        primary_language: patient.primary_language ?? '',
        email: patient.email ?? '',
        phone: patient.phone ?? '',
        street: patient.street,
        city: patient.city,
        state: patient.state,
        zip_code: patient.zip_code,
      })
    }
  }, [open, patient, form])

  function onSubmit(values: EditDemographicsValues) {
    const data = { ...values, avatar_url: selectedAvatar ?? undefined }
    mutate(
      { id: patientId, data },
      {
        onSuccess: () => {
          toast.success('Demographics updated successfully')
          onOpenChange(false)
        },
        onError: () => {
          toast.error('Failed to update demographics')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit Demographics</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label>Avatar</Label>
              <div className='grid grid-cols-6 gap-2'>
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
                      <AvatarFallback>{getInitials(`${patient.first_name} ${patient.last_name}`)}</AvatarFallback>
                    </Avatar>
                    {selectedAvatar === url && (
                      <span className='bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full'>
                        <CheckIcon className='size-2.5' />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='first_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='middle_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='last_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='date_of_birth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='sex'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select sex' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SEX_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='primary_language'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type='email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='street'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='state'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select state' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {US_STATES.map((s) => (
                          <SelectItem key={s.abbreviation} value={s.abbreviation}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='zip_code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
