import { Injectable } from '@nestjs/common';
import { MissingPerson, MissingPersonStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  MatchCandidate,
  MatchHint,
} from './interfaces/match-scorer.interface';
import { RuleBasedMatchScorer } from './scorers/rule-based-match.scorer';

export interface EnrichedMissingPerson {
  record: MissingPerson;
  hints: MatchHint[];
  effectiveStatus: MissingPersonStatus;
}

@Injectable()
export class MatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scorer: RuleBasedMatchScorer,
  ) {}

  async analyzeMissingPerson(record: MissingPerson): Promise<MatchHint[]> {
    const candidates = await this.loadCandidates(record.emergencyId, record.id);
    const hints = this.scorer.findHints(this.toCandidate(record), candidates);

    await this.persistMatchResult(record.id, hints);

    return hints;
  }

  /** Calcula coincidencias en vivo al listar — evita estados obsoletos en la UI. */
  enrichWithLiveMatches(records: MissingPerson[]): EnrichedMissingPerson[] {
    const candidates = records.map((record) => this.toCandidate(record));

    return records.map((record) => {
      const hints = this.scorer.findHints(
        this.toCandidate(record),
        candidates.filter((candidate) => candidate.id !== record.id),
      );

      return {
        record,
        hints,
        effectiveStatus: this.deriveEffectiveStatus(record.status, hints),
      };
    });
  }

  private async persistMatchResult(
    recordId: string,
    hints: MatchHint[],
  ): Promise<void> {
    if (hints.length === 0) {
      await this.prisma.missingPerson.updateMany({
        where: {
          id: recordId,
          status: MissingPersonStatus.POSSIBLE_MATCH,
        },
        data: { status: MissingPersonStatus.SEARCHING },
      });
      return;
    }

    const idsToMark = new Set<string>([recordId, ...hints.map((h) => h.candidateId)]);

    await this.prisma.missingPerson.updateMany({
      where: {
        id: { in: [...idsToMark] },
        status: {
          in: [MissingPersonStatus.SEARCHING, MissingPersonStatus.POSSIBLE_MATCH],
        },
      },
      data: { status: MissingPersonStatus.POSSIBLE_MATCH },
    });
  }

  private deriveEffectiveStatus(
    stored: MissingPersonStatus,
    hints: MatchHint[],
  ): MissingPersonStatus {
    if (
      stored === MissingPersonStatus.FOUND ||
      stored === MissingPersonStatus.REUNITED
    ) {
      return stored;
    }

    return hints.length > 0
      ? MissingPersonStatus.POSSIBLE_MATCH
      : MissingPersonStatus.SEARCHING;
  }

  private async loadCandidates(
    emergencyId: string,
    excludeId: string,
  ): Promise<MatchCandidate[]> {
    return this.prisma.missingPerson.findMany({
      where: {
        emergencyId,
        id: { not: excludeId },
        status: {
          in: [MissingPersonStatus.SEARCHING, MissingPersonStatus.POSSIBLE_MATCH],
        },
      },
      select: {
        id: true,
        clientId: true,
        name: true,
        age: true,
        lastKnownLocation: true,
        physicalDescription: true,
        familyContact: true,
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
  }

  private toCandidate(record: MissingPerson): MatchCandidate {
    return {
      id: record.id,
      clientId: record.clientId,
      name: record.name,
      age: record.age,
      lastKnownLocation: record.lastKnownLocation,
      physicalDescription: record.physicalDescription,
      familyContact: record.familyContact,
    };
  }
}
