import type { Stage1OnboardingData } from '@/types/onboarding.types'

export class OnboardingApiError extends Error {
  statusCode: number
  errors?: Record<string, any>

  constructor(message: string, statusCode: number, errors?: Record<string, any>) {
    super(message)
    this.name = 'OnboardingApiError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

const ONBOARDING_API_BASE = '/api/onboarding'

export const onboardingService = {
  /**
   * Submits Stage 1 student and parent/guardian personal details to the backend.
   */
  async submitStage1(
    data: Stage1OnboardingData,
    token: string | null
  ): Promise<{ status: string; message: string; data?: any }> {
    try {
      const res = await fetch(`${ONBOARDING_API_BASE}/personal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })

      const isJson = res.headers.get('content-type')?.includes('application/json')
      const responseData = isJson ? await res.json() : null

      if (!res.ok) {
        let errorMsg = responseData?.message || 'Failed to save student details. Please try again.'
        if (responseData?.errors?.fieldErrors) {
          const firstField = Object.values(responseData.errors.fieldErrors)[0]
          if (Array.isArray(firstField) && firstField[0]) {
            errorMsg = firstField[0]
          }
        }
        throw new OnboardingApiError(errorMsg, res.status, responseData?.errors)
      }

      return responseData || { status: 'success', message: 'Details saved successfully' }
    } catch (err: any) {
      if (err instanceof OnboardingApiError) throw err
      throw new OnboardingApiError(
        err.message || 'Network error occurred while submitting onboarding data. Please check your connection.',
        0
      )
    }
  },

  /**
   * Fetches previously saved onboarding status and details for the current user, if any.
   */
  async getExistingProfile(token: string | null): Promise<any | null> {
    if (!token) return null
    try {
      const res = await fetch(`${ONBOARDING_API_BASE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) return null
      const data = await res.json()
      return data?.data || null
    } catch {
      // If endpoint is unreachable or empty, return null silently
      return null
    }
  },
}
