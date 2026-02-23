import { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { prescriptionSchema } from '@/lib/schemas'
import type { PrescriptionValues } from '@/lib/schemas'
import type { CreatePrescriptionRequest } from '@/lib/types'
import { usePatient } from '@/hooks/use-patients'
import { useCreatePrescription } from '@/hooks/use-prescriptions'
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
import { Skeleton } from '@/components/ui/skeleton'
import { PrescriptionStepIndicator } from '@/components/patients/prescribe/PrescriptionStepIndicator'
import { Step1Medication } from '@/components/patients/prescribe/Step1Medication'
import { Step2Pharmacy } from '@/components/patients/prescribe/Step2Pharmacy'
import { Step3Confirm } from '@/components/patients/prescribe/Step3Confirm'

const STEP_CONFIG = [
  { title: 'Select Medication', description: 'Choose a medication and set dosage details.' },
  { title: 'Select Pharmacy', description: 'Pick a nearby pharmacy to send the prescription to.' },
  { title: 'Review & Confirm', description: 'Review the prescription before saving.' },
]

const PrescriptionFlow = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: patient, isLoading: patientLoading } = usePatient(id)
  const { mutate, isPending } = useCreatePrescription()
  const [currentStep, setCurrentStep] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')
  const [slideKey, setSlideKey] = useState(0)

  const form = useForm<PrescriptionValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(prescriptionSchema) as any,
    defaultValues: {
      medication_id: '',
      dosage: '',
      frequency: '',
      quantity: 0,
      duration: '',
      pharmacy_name: '',
      pharmacy_address: '',
      pharmacy_lat: 0,
      pharmacy_lng: 0,
      notes: '',
      save_as_preferred_pharmacy: false,
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
        return form.trigger(['medication_id', 'dosage', 'frequency', 'quantity'])
      case 1:
        return form.trigger(['pharmacy_name', 'pharmacy_address', 'pharmacy_lat', 'pharmacy_lng'])
      default:
        return true
    }
  }, [currentStep, form])

  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep()
    if (!isValid) return
    goToStep(Math.min(currentStep + 1, 2))
  }, [currentStep, validateCurrentStep, goToStep])

  const handleBack = useCallback(() => {
    goToStep(Math.max(currentStep - 1, 0))
  }, [currentStep, goToStep])

  const handleSubmit = useCallback(() => {
    const values = form.getValues()

    const payload: CreatePrescriptionRequest = {
      medication_id: values.medication_id,
      dosage: values.dosage,
      frequency: values.frequency,
      quantity: values.quantity,
      pharmacy_name: values.pharmacy_name,
      pharmacy_address: values.pharmacy_address,
      pharmacy_lat: values.pharmacy_lat,
      pharmacy_lng: values.pharmacy_lng,
    }

    if (values.duration) payload.duration = values.duration
    if (values.notes) payload.notes = values.notes
    if (values.save_as_preferred_pharmacy) payload.save_as_preferred_pharmacy = true

    mutate(
      { patientId: id!, data: payload },
      {
        onSuccess: () => {
          toast.success('Prescription created successfully')
          navigate(`/patients/${id}`)
        },
        onError: () => {
          toast.error('Failed to create prescription. Please try again.')
        },
      },
    )
  }, [form, mutate, id, navigate])

  // Loading state
  if (patientLoading) {
    return (
      <div className='mx-auto max-w-4xl'>
        <Skeleton className='mb-4 h-5 w-48' />
        <Card>
          <CardHeader>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='mt-2 h-6 w-64' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-64 w-full' />
          </CardContent>
        </Card>
      </div>
    )
  }

  // 404 state
  if (!patient) {
    return (
      <div className='mx-auto max-w-4xl'>
        <Card>
          <CardContent className='flex min-h-96 items-center justify-center'>
            <div className='text-center'>
              <h1 className='text-2xl font-semibold'>Patient not found</h1>
              <p className='text-muted-foreground mt-2'>
                The patient you&apos;re looking for doesn&apos;t exist.
              </p>
              <Button asChild className='mt-4' variant='outline'>
                <Link to='/patients'>Back to patients</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLastStep = currentStep === 2
  const isFirstStep = currentStep === 0
  const stepConfig = STEP_CONFIG[currentStep]
  const patientName = `${patient.first_name} ${patient.last_name}`

  return (
    <div className='mx-auto max-w-4xl'>
      <Link
        to={`/patients/${id}`}
        className='text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors'
      >
        <ArrowLeft className='size-3' />
        Back to patient
      </Link>

      <Card>
        <CardHeader className='space-y-4'>
          <PrescriptionStepIndicator currentStep={currentStep} />
          <div>
            <CardTitle>{stepConfig.title}</CardTitle>
            <CardDescription>
              Prescribing for <span className='font-medium'>{patientName}</span> — {stepConfig.description}
            </CardDescription>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            <CardContent className='overflow-hidden'>
              <div
                key={slideKey}
                className={slideDirection === 'left' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
              >
                {currentStep === 0 && <Step1Medication form={form} />}
                {currentStep === 1 && <Step2Pharmacy form={form} patientId={id!} />}
                {currentStep === 2 && <Step3Confirm form={form} patientName={patientName} />}
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
              {isLastStep ? (
                <Button
                  type='button'
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className='mr-1 size-4 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className='mr-1 size-4' />
                      Confirm &amp; Save
                    </>
                  )}
                </Button>
              ) : (
                <Button type='button' onClick={handleNext}>
                  Next
                  <ArrowRight className='ml-1 size-4' />
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

export default PrescriptionFlow
