import { useSearchParams } from 'react-router-dom'
import { StudentDetailsPage } from './onboarding/StudentDetailsPage'
import { AcademicInformation } from './onboarding/AcademicInformation'
import { ReviewAndConfirm } from './onboarding/ReviewAndConfirm'

export function Onboarding() {
  const [searchParams] = useSearchParams()
  const step = searchParams.get('step')

  // When navigated to Stage 2: Unified Academic Information page
  if (step === 'academic') {
    return <AcademicInformation />
  }

  // When navigated to Stage 3: Unified Review & Confirm page
  if (step === 'review') {
    return <ReviewAndConfirm />
  }

  // Default: Stage 1 (Student & Parent Details)
  return <StudentDetailsPage />
}
