import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, SkipForward, UserPlus } from 'lucide-react'
import { createPatientSchema } from '@/lib/schemas'
import type { CreatePatientValues } from '@/lib/schemas'
import type { CreatePatientRequest } from '@/lib/types'
import { useCreatePatient } from '@/hooks/use-patients'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { StepIndicator } from '@/components/patients/create/StepIndicator'
import { Step1BasicInfo } from '@/components/patients/create/Step1BasicInfo'
import { Step2ContactAddress } from '@/components/patients/create/Step2ContactAddress'
import { Step3EmergencyContacts } from '@/components/patients/create/Step3EmergencyContacts'
import { Step4Insurance } from '@/components/patients/create/Step4Insurance'
import { Step5Medical } from '@/components/patients/create/Step5Medical'
import { Step6Review } from '@/components/patients/create/Step6Review'

const STEP_CONFIG = [
  { title: 'Basic Information', description: 'Enter the patient\'s name, date of birth, and demographics.' },
  { title: 'Contact & Address', description: 'Enter the patient\'s contact information and mailing address.' },
  { title: 'Emergency Contacts', description: 'Add emergency contacts for this patient.' },
  { title: 'Insurance Information', description: 'Enter the patient\'s insurance details.' },
  { title: 'Medical Information', description: 'Enter any known medical information.' },
  { title: 'Review & Create', description: 'Review all information before creating the patient record.' },
]

const SKIPPABLE_STEPS = new Set([2, 3, 4])

const PatientCreate = () => {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreatePatient()
  const [currentStep, setCurrentStep] = useState(0)
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set())
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')
  const [slideKey, setSlideKey] = useState(0)

  const form = useForm<CreatePatientValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createPatientSchema) as any,
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      sex: undefined,
      primary_language: 'English',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zip_code: '',
      emergency_contacts: [],
      insurance: {
        provider_name: '',
        policy_number: '',
        group_number: '',
        holder_name: '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        holder_relationship: '' as any,
      },
      medical: {
        primary_diagnosis: '',
        allergies: '',
        current_medications: '',
        additional_conditions: '',
      },
    },
  })

  const goToStep = useCallback((next: number) => {
    setSlideDirection(next > currentStep ? 'left' : 'right')
    setSlideKey((k) => k + 1)
    setCurrentStep(next)
  }, [currentStep])

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    switch (currentStep) {
      case 0:
        return form.trigger(['first_name', 'last_name', 'date_of_birth', 'sex'])
      case 1:
        return form.trigger(['street', 'city', 'state', 'zip_code'])
      case 2: {
        const contacts = form.getValues('emergency_contacts')
        if (contacts && contacts.length > 0) {
          return form.trigger('emergency_contacts')
        }
        return true
      }
      case 3: {
        const insurance = form.getValues('insurance')
        if (insurance?.provider_name || insurance?.policy_number || insurance?.holder_name) {
          return form.trigger([
            'insurance.provider_name',
            'insurance.policy_number',
            'insurance.holder_name',
            'insurance.holder_relationship',
          ])
        }
        return true
      }
      case 4:
        return true
      default:
        return true
    }
  }, [currentStep, form])

  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep()
    if (!isValid) return

    setSkippedSteps((prev) => {
      const next = new Set(prev)
      next.delete(currentStep)
      return next
    })

    goToStep(Math.min(currentStep + 1, 5))
  }, [currentStep, validateCurrentStep, goToStep])

  const handleBack = useCallback(() => {
    goToStep(Math.max(currentStep - 1, 0))
  }, [currentStep, goToStep])

  const handleSkip = useCallback(() => {
    if (currentStep === 2) {
      form.setValue('emergency_contacts', [])
    } else if (currentStep === 3) {
      form.setValue('insurance', {
        provider_name: '',
        policy_number: '',
        group_number: '',
        holder_name: '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        holder_relationship: '' as any,
      })
    } else if (currentStep === 4) {
      form.setValue('medical', {
        primary_diagnosis: '',
        allergies: '',
        current_medications: '',
        additional_conditions: '',
      })
    }

    setSkippedSteps((prev) => new Set(prev).add(currentStep))
    goToStep(Math.min(currentStep + 1, 5))
  }, [currentStep, form, goToStep])

  const handleEditStep = useCallback((step: number) => {
    goToStep(step)
  }, [goToStep])

  const handleSubmit = useCallback(() => {
    const values = form.getValues()

    const payload: CreatePatientRequest = {
      first_name: values.first_name,
      last_name: values.last_name,
      date_of_birth: values.date_of_birth,
      sex: values.sex,
      street: values.street,
      city: values.city,
      state: values.state,
      zip_code: values.zip_code,
    }

    if (values.middle_name) payload.middle_name = values.middle_name
    if (values.primary_language) payload.primary_language = values.primary_language
    if (values.email) payload.email = values.email
    if (values.phone) payload.phone = values.phone

    if (values.emergency_contacts && values.emergency_contacts.length > 0) {
      payload.emergency_contacts = values.emergency_contacts.map((c) => ({
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        email: c.email || undefined,
        is_primary: c.is_primary,
      }))
    }

    if (values.insurance?.provider_name && values.insurance?.policy_number && values.insurance?.holder_name) {
      payload.insurance = {
        provider_name: values.insurance.provider_name,
        policy_number: values.insurance.policy_number,
        group_number: values.insurance.group_number || undefined,
        holder_name: values.insurance.holder_name,
        holder_relationship: values.insurance.holder_relationship ?? 'Self',
      }
    }

    const med = values.medical
    if (med?.primary_diagnosis || med?.allergies || med?.current_medications || med?.additional_conditions) {
      payload.medical = {
        primary_diagnosis: med.primary_diagnosis || undefined,
        allergies: med.allergies || undefined,
        current_medications: med.current_medications || undefined,
        additional_conditions: med.additional_conditions || undefined,
      }
    }

    mutate(payload, {
      onSuccess: (data) => {
        toast.success('Patient created successfully')
        navigate(`/patients/${data.id}`)
      },
      onError: () => {
        toast.error('Failed to create patient. Please try again.')
      },
    })
  }, [form, mutate, navigate])

  const isSkippable = SKIPPABLE_STEPS.has(currentStep)
  const isLastStep = currentStep === 5
  const isFirstStep = currentStep === 0
  const stepConfig = STEP_CONFIG[currentStep]

  return (
    <div className='mx-auto max-w-3xl'>
      <Card>
        <CardHeader className='space-y-4'>
          <StepIndicator currentStep={currentStep} skippedSteps={skippedSteps} />
          <div>
            <CardTitle>{stepConfig.title}</CardTitle>
            <CardDescription>{stepConfig.description}</CardDescription>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            <CardContent className='overflow-hidden'>
              <div
                key={slideKey}
                className={slideDirection === 'left' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
              >
                {currentStep === 0 && <Step1BasicInfo form={form} />}
                {currentStep === 1 && <Step2ContactAddress form={form} />}
                {currentStep === 2 && <Step3EmergencyContacts form={form} />}
                {currentStep === 3 && <Step4Insurance form={form} />}
                {currentStep === 4 && <Step5Medical form={form} />}
                {currentStep === 5 && (
                  <Step6Review
                    form={form}
                    skippedSteps={skippedSteps}
                    onEditStep={handleEditStep}
                  />
                )}
              </div>
            </CardContent>
            <CardFooter className='flex justify-between pt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={handleBack}
                disabled={isFirstStep}
              >
                <ArrowLeft className='mr-1 size-4' />
                Back
              </Button>
              <div className='flex gap-2'>
                {isSkippable && (
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={handleSkip}
                  >
                    Skip
                    <SkipForward className='ml-1 size-4' />
                  </Button>
                )}
                {isLastStep ? (
                  <Button
                    type='button'
                    onClick={handleSubmit}
                    disabled={isPending}
                  >
                    {isPending ? 'Creating...' : (
                      <>
                        <UserPlus className='mr-1 size-4' />
                        Create Patient
                      </>
                    )}
                  </Button>
                ) : (
                  <Button type='button' onClick={handleNext}>
                    Next
                    <ArrowRight className='ml-1 size-4' />
                  </Button>
                )}
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

export default PatientCreate
