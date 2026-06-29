import { apiFetch } from './client';

export type MissingPersonStatus =
  | 'SEARCHING'
  | 'POSSIBLE_MATCH'
  | 'FOUND'
  | 'REUNITED';

export interface MissingPerson {
  id: string;
  emergencyId: string;
  name: string;
  age: number | null;
  sex: string;
  lastKnownLocation: string;
  familyContact: string | null;
  physicalDescription: string | null;
  clothing: string | null;
  status: MissingPersonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMissingPersonInput {
  emergencyId: string;
  name: string;
  age?: number;
  lastKnownLocation: string;
  familyContact?: string;
  physicalDescription?: string;
  clothing?: string;
  clientId?: string;
}

export interface QueryMissingPersonsParams {
  emergencyId: string;
  search?: string;
  status?: MissingPersonStatus;
}

export function fetchMissingPersons(
  params: QueryMissingPersonsParams,
): Promise<MissingPerson[]> {
  const query = new URLSearchParams({ emergencyId: params.emergencyId });

  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);

  return apiFetch<MissingPerson[]>(`/missing-persons?${query.toString()}`, {
    cache: 'no-store',
  });
}

export function createMissingPerson(
  input: CreateMissingPersonInput,
): Promise<MissingPerson> {
  return apiFetch<MissingPerson>('/missing-persons', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
  });
}
