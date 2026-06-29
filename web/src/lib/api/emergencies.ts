import { apiFetch } from './client';

export interface Emergency {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  country: {
    code: string;
    name: string;
  };
}

export function fetchActiveEmergencies(): Promise<Emergency[]> {
  return apiFetch<Emergency[]>('/emergencies/active', { cache: 'no-store' });
}

export function fetchEmergencyById(id: string): Promise<Emergency> {
  return apiFetch<Emergency>(`/emergencies/${id}`, { cache: 'no-store' });
}
