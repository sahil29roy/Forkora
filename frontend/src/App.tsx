import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { AuthProvider } from '@/context/AuthContext'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { Onboarding } from '@/pages/Onboarding'
import { Dashboard } from '@/pages/Dashboard'
import { Terms } from '@/pages/Terms'
import { Privacy } from '@/pages/Privacy'
import { AssessmentOverviewPage } from '@/pages/assessment/AssessmentOverviewPage'
import { AssessmentIntro } from '@/pages/assessment/AssessmentIntro'
import { AssessmentInstructionsPage } from '@/pages/assessment/AssessmentInstructionsPage'
import { AssessmentSessionPage } from '@/pages/assessment/AssessmentSessionPage'
import { AssessmentReviewPage } from '@/pages/assessment/AssessmentReviewPage'
import { AssessmentResultsPage } from '@/pages/assessment/AssessmentResultsPage'
import { CareerDiscoveryPage } from '@/pages/CareerDiscoveryPage'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="forkora-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/career-discovery" element={<CareerDiscoveryPage />} />
            <Route path="/career-exploration" element={<CareerDiscoveryPage />} />
            <Route path="/assessments" element={<AssessmentOverviewPage />} />
            <Route path="/assessment" element={<AssessmentOverviewPage />} />
            <Route path="/assessment/intro" element={<AssessmentIntro />} />
            <Route path="/assessments/:moduleId/instructions" element={<AssessmentInstructionsPage />} />
            <Route path="/assessments/:moduleId/:attemptId" element={<AssessmentSessionPage />} />
            <Route path="/assessments/:moduleId/:attemptId/review" element={<AssessmentReviewPage />} />
            <Route path="/assessments/:moduleId/:attemptId/results" element={<AssessmentResultsPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
