import type {
  CareerRecommendationsResponse,
  CareerPreferencesData,
  CareerPathway,
} from '@/types/career.types';

const API_BASE = '/api/careers';

export class CareerApiError extends Error {
  statusCode: number;
  errorData?: any;

  constructor(message: string, statusCode: number, errorData?: any) {
    super(message);
    this.name = 'CareerApiError';
    this.statusCode = statusCode;
    this.errorData = errorData;
  }
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
  token: string | null = null
): Promise<T> {
  const authToken = token || localStorage.getItem('forkora_auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const json = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg =
      json?.message ||
      json?.error ||
      `Request failed with status ${response.status} (${response.statusText})`;
    throw new CareerApiError(errorMsg, response.status, json);
  }

  return (json?.data !== undefined ? json.data : json) as T;
}

export const careerService = {
  /**
   * Fetches personalized and ranked career recommendations for the authenticated student.
   */
  async getRecommendations(token?: string | null): Promise<CareerRecommendationsResponse> {
    return fetchWithAuth<CareerRecommendationsResponse>('/recommendations', { method: 'GET' }, token);
  },

  /**
   * Fetches verified pathways for a specific career from the student's current stage.
   */
  async getPathways(
    careerCode: string,
    fromStage?: string,
    token?: string | null
  ): Promise<{ career: string; career_code: string; start_stage: string; pathways: CareerPathway[] }> {
    const query = fromStage ? `?from=${encodeURIComponent(fromStage)}` : '';
    return fetchWithAuth<{ career: string; career_code: string; start_stage: string; pathways: CareerPathway[] }>(
      `/pathways/${encodeURIComponent(careerCode)}${query}`,
      { method: 'GET' },
      token
    );
  },

  /**
   * Fetches catalog nodes (careers, courses, exams, streams).
   */
  async getNodes(
    params?: { type?: string; level?: string; stream?: string },
    token?: string | null
  ): Promise<{ total: number; nodes: any[] }> {
    const q = new URLSearchParams();
    if (params?.type) q.append('type', params.type);
    if (params?.level) q.append('level', params.level);
    if (params?.stream) q.append('stream', params.stream);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return fetchWithAuth<{ total: number; nodes: any[] }>(`/nodes${queryString}`, { method: 'GET' }, token);
  },

  /**
   * Retrieves the student's saved career preferences.
   */
  async getPreferences(token?: string | null): Promise<CareerPreferencesData> {
    return fetchWithAuth<CareerPreferencesData>('/preferences', { method: 'GET' }, token);
  },

  /**
   * Updates student career preferences.
   */
  async updatePreferences(
    data: Partial<CareerPreferencesData>,
    token?: string | null
  ): Promise<{ message: string; data: CareerPreferencesData }> {
    return fetchWithAuth<{ message: string; data: CareerPreferencesData }>(
      '/preferences',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  },

  /**
   * Local storage bookmarking for saved careers (synchronous, persisted client-side until backend table is deployed)
   */
  getSavedCareerCodes(): string[] {
    try {
      const raw = localStorage.getItem('forkora_saved_careers');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  toggleSaveCareerCode(code: string): boolean {
    try {
      const current = this.getSavedCareerCodes();
      let updated: string[];
      let isSavedNow = false;
      if (current.includes(code)) {
        updated = current.filter((c) => c !== code);
        isSavedNow = false;
      } else {
        updated = [...current, code];
        isSavedNow = true;
      }
      localStorage.setItem('forkora_saved_careers', JSON.stringify(updated));
      return isSavedNow;
    } catch {
      return false;
    }
  },
};
