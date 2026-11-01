import type {
  ModuleProgressDTO,
  QuestionsDeliveryPayload,
  SaveResponsePayload,
  SaveResponseResult,
  AttemptProgressDTO,
  AssessmentResultDTO,
} from '@/types/assessment.types'

const API_BASE = '/api/assessments'

export class AssessmentApiError extends Error {
  statusCode: number
  errorData?: any

  constructor(message: string, statusCode: number, errorData?: any) {
    super(message)
    this.name = 'AssessmentApiError'
    this.statusCode = statusCode
    this.errorData = errorData
  }
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
  token: string | null = null
): Promise<T> {
  const authToken = token || localStorage.getItem('forkora_auth_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers as Record<string, string>),
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const json = isJson ? await response.json() : null

  if (!response.ok) {
    const errorMsg =
      json?.message ||
      json?.error ||
      `Request failed with status ${response.status} (${response.statusText})`
    throw new AssessmentApiError(errorMsg, response.status, json)
  }

  return (json?.data !== undefined ? json.data : json) as T
}

export const assessmentService = {
  /**
   * Fetches all 4 assessment modules alongside student's active/completed progress.
   */
  async getModules(token?: string | null): Promise<ModuleProgressDTO[]> {
    return fetchWithAuth<ModuleProgressDTO[]>('/modules', { method: 'GET' }, token)
  },

  /**
   * Fetches consolidated status across all modules.
   */
  async getConsolidatedStatus(token?: string | null): Promise<ModuleProgressDTO[]> {
    return fetchWithAuth<ModuleProgressDTO[]>('/status', { method: 'GET' }, token)
  },

  /**
   * Fetches instructions and details for a single module.
   */
  async getModuleDetails(moduleId: string, token?: string | null): Promise<any> {
    return fetchWithAuth<any>(`/modules/${moduleId.toLowerCase()}`, { method: 'GET' }, token)
  },

  /**
   * Starts a new attempt or resumes an existing incomplete attempt.
   */
  async startOrResumeAssessment(
    moduleId: string,
    token?: string | null
  ): Promise<{ resumed: boolean; attempt: any }> {
    const raw = await fetchWithAuth<any>(
      `/modules/${moduleId.toLowerCase()}/start`,
      { method: 'POST', body: JSON.stringify({}) },
      token
    )
    return {
      resumed: Boolean(raw?.resumed),
      attempt: raw?.data || raw,
    }
  },

  /**
   * Resumes an existing attempt by ID.
   */
  async resumeAttempt(
    attemptId: number,
    token?: string | null
  ): Promise<{ attempt: any; progress: AttemptProgressDTO }> {
    return fetchWithAuth<{ attempt: any; progress: AttemptProgressDTO }>(
      `/attempts/${attemptId}`,
      { method: 'GET' },
      token
    )
  },

  /**
   * Retrieves assigned questions in stable randomised order (strictly safe, no answers).
   */
  async getAssignedQuestions(
    attemptId: number,
    token?: string | null
  ): Promise<QuestionsDeliveryPayload> {
    return fetchWithAuth<QuestionsDeliveryPayload>(
      `/attempts/${attemptId}/questions`,
      { method: 'GET' },
      token
    )
  },

  /**
   * Saves student response to an assigned question.
   */
  async saveResponse(
    attemptId: number,
    payload: SaveResponsePayload,
    token?: string | null
  ): Promise<SaveResponseResult> {
    return fetchWithAuth<SaveResponseResult>(
      `/attempts/${attemptId}/responses`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    )
  },

  /**
   * Retrieves attempt progress percentage and counts.
   */
  async getProgress(attemptId: number, token?: string | null): Promise<AttemptProgressDTO> {
    return fetchWithAuth<AttemptProgressDTO>(
      `/attempts/${attemptId}/progress`,
      { method: 'GET' },
      token
    )
  },

  /**
   * Submits an assessment attempt for server-side scoring.
   */
  async submitAssessment(
    attemptId: number,
    token?: string | null
  ): Promise<AssessmentResultDTO> {
    return fetchWithAuth<AssessmentResultDTO>(
      `/attempts/${attemptId}/submit`,
      { method: 'POST', body: JSON.stringify({}) },
      token
    )
  },

  /**
   * Fetches completed assessment score breakdown and dimension insights.
   */
  async getResults(attemptId: number, token?: string | null): Promise<AssessmentResultDTO> {
    return fetchWithAuth<AssessmentResultDTO>(
      `/attempts/${attemptId}/results`,
      { method: 'GET' },
      token
    )
  },
}
