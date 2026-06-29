import { Injectable } from '@nestjs/common';
import {
  MatchCandidate,
  MatchHint,
  MatchScorer,
} from '../interfaces/match-scorer.interface';

/** Requiere nombre similar + al menos otra señal (ubicación o edad). */
const MATCH_THRESHOLD = 0.72;
const MIN_NAME_SCORE = 0.8;

@Injectable()
export class RuleBasedMatchScorer implements MatchScorer {
  findHints(source: MatchCandidate, candidates: MatchCandidate[]): MatchHint[] {
    return candidates
      .filter((candidate) => candidate.id !== source.id)
      .filter((candidate) => candidate.clientId !== source.clientId)
      .filter((candidate) => !this.isExactDuplicate(source, candidate))
      .map((candidate) => this.scoreCandidate(source, candidate))
      .filter((hint) => hint.score >= MATCH_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  /** Mismo reporte enviado dos veces — no es una coincidencia útil. */
  private isExactDuplicate(a: MatchCandidate, b: MatchCandidate): boolean {
    const sameName = this.nameSimilarity(a.name, b.name) >= 0.95;
    const sameLocation =
      this.locationSimilarity(a.lastKnownLocation, b.lastKnownLocation) >= 0.9;
    const sameAge =
      a.age == null ||
      b.age == null ||
      Math.abs(a.age - b.age) <= 1;

    const sameContact =
      !a.familyContact ||
      !b.familyContact ||
      this.normalize(a.familyContact) === this.normalize(b.familyContact);

    return sameName && sameLocation && sameAge && sameContact;
  }

  private scoreCandidate(
    source: MatchCandidate,
    candidate: MatchCandidate,
  ): MatchHint {
    const reasons: string[] = [];
    let score = 0;

    const nameScore = this.nameSimilarity(source.name, candidate.name);
    const nameMatches = nameScore >= MIN_NAME_SCORE;

    if (nameMatches) {
      score += nameScore * 0.5;
      reasons.push('Nombre similar');
    }

    const locationScore = this.locationSimilarity(
      source.lastKnownLocation,
      candidate.lastKnownLocation,
    );
    const locationMatches = locationScore >= 0.6;

    if (locationMatches) {
      score += locationScore * 0.3;
      reasons.push('Ubicación similar');
    }

    const ageMatches =
      source.age != null &&
      candidate.age != null &&
      Math.abs(source.age - candidate.age) <= 2;

    if (ageMatches) {
      score += 0.2;
      reasons.push('Edad compatible');
    }

    const signalCount = [nameMatches, locationMatches, ageMatches].filter(
      Boolean,
    ).length;

    const isValidMatch =
      nameMatches && signalCount >= 2 && score >= MATCH_THRESHOLD;

    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      score: isValidMatch ? Math.min(1, score) : 0,
      reasons: isValidMatch ? reasons : [],
    };
  }

  private nameSimilarity(a: string, b: string): number {
    const left = this.normalize(a);
    const right = this.normalize(b);

    if (!left || !right) return 0;
    if (left === right) return 1;

    const distance = this.levenshtein(left, right);
    const maxLen = Math.max(left.length, right.length);
    return 1 - distance / maxLen;
  }

  private locationSimilarity(a: string, b: string): number {
    const left = this.normalize(a);
    const right = this.normalize(b);

    if (!left || !right) return 0;
    if (left.includes(right) || right.includes(left)) return 1;

    return this.nameSimilarity(left, right);
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .trim();
  }

  private levenshtein(a: string, b: string): number {
    const matrix = Array.from({ length: a.length + 1 }, () =>
      Array<number>(b.length + 1).fill(0),
    );

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    return matrix[a.length][b.length];
  }
}
