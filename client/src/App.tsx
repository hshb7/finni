import { BrowserRouter, Routes, Route } from 'react-router'

import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import AppShell from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Patients from '@/pages/Patients'
import PatientCreate from '@/pages/PatientCreate'
import PatientProfile from '@/pages/PatientProfile'
import PrescriptionFlow from '@/pages/PrescriptionFlow'

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path='patients' element={<Patients />} />
            <Route path='patients/new' element={<PatientCreate />} />
            <Route path='patients/:id' element={<PatientProfile />} />
            <Route path='patients/:id/prescribe' element={<PrescriptionFlow />} />
          </Route>
        </Routes>
        <Toaster />
      </TooltipProvider>
    </BrowserRouter>
  )
}

export default App
