import { BrowserRouter, Routes, Route } from 'react-router'

import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppShell from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Patients from '@/pages/Patients'
import PatientCreate from '@/pages/PatientCreate'
import PatientProfile from '@/pages/PatientProfile'
import PrescriptionFlow from '@/pages/PrescriptionFlow'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Routes>
            <Route path='login' element={<Login />} />
            <Route path='register' element={<Register />} />
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path='patients' element={<Patients />} />
              <Route path='patients/new' element={<PatientCreate />} />
              <Route path='patients/:id' element={<PatientProfile />} />
              <Route path='patients/:id/prescribe' element={<PrescriptionFlow />} />
              <Route path='profile' element={<Profile />} />
              <Route path='settings' element={<Settings />} />
            </Route>
          </Routes>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
