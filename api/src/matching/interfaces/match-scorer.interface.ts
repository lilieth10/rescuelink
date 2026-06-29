export interface MatchCandidate {
  id: string;
  clientId?: string | null;
  name: string;
  age: number | null;
  lastKnownLocation: string;
  physicalDescription: string | null;
  familyContact?: string | null;
}

export interface MatchHint {
  candidateId: string;
  candidateName: string;
  score: number;
  reasons: string[];
}

export interface MatchScorer {
  findHints(
    source: MatchCandidate,
    candidates: MatchCandidate[],
  ): MatchHint[];
}
