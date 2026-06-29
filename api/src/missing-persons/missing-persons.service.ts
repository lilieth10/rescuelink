import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MissingPerson, MissingPersonStatus, Prisma } from '@prisma/client';
import { MatchingService } from '../matching/matching.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMissingPersonDto } from './dto/create-missing-person.dto';
import { MissingPersonResponseDto } from './dto/missing-person-response.dto';
import { QueryMissingPersonsDto } from './dto/query-missing-persons.dto';

@Injectable()
export class MissingPersonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingService: MatchingService,
  ) {}

  async findAll(
    query: QueryMissingPersonsDto,
  ): Promise<MissingPersonResponseDto[]> {
    const where: Prisma.MissingPersonWhereInput = {
      emergencyId: query.emergencyId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { lastKnownLocation: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const records = await this.prisma.missingPerson.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const enriched = this.matchingService.enrichWithLiveMatches(records);

    return enriched.map(({ record, hints, effectiveStatus }) =>
      this.toResponse({ ...record, status: effectiveStatus }, hints),
    );
  }

  async findById(id: string): Promise<MissingPersonResponseDto> {
    const record = await this.prisma.missingPerson.findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException('Persona desaparecida no encontrada');
    }

    return this.toResponse(record);
  }

  async create(
    dto: CreateMissingPersonDto,
    reportedById?: string,
  ): Promise<MissingPersonResponseDto> {
    const { record, hints, alreadyExists } = await this.createRecord(
      dto,
      reportedById,
    );
    return this.toResponse(record, hints, alreadyExists);
  }

  async createFromSync(
    dto: CreateMissingPersonDto,
  ): Promise<MissingPersonResponseDto> {
    const { record, hints, alreadyExists } = await this.createRecord(dto);
    return this.toResponse(record, hints, alreadyExists);
  }

  private async createRecord(
    dto: CreateMissingPersonDto,
    reportedById?: string,
  ): Promise<{
    record: MissingPerson;
    hints: MissingPersonResponseDto['matchHints'];
    alreadyExists: boolean;
  }> {
    await this.ensureEmergencyExists(dto.emergencyId);

    const duplicate = await this.findDuplicateReport(dto);
    if (duplicate) {
      return { record: duplicate, hints: [], alreadyExists: true };
    }

    const record = await this.prisma.missingPerson.create({
      data: {
        emergencyId: dto.emergencyId,
        name: dto.name.trim(),
        age: dto.age,
        sex: dto.sex,
        lastKnownLocation: dto.lastKnownLocation.trim(),
        familyContact: dto.familyContact?.trim(),
        physicalDescription: dto.physicalDescription?.trim(),
        clothing: dto.clothing?.trim(),
        clientId: dto.clientId,
        reportedById,
        status: MissingPersonStatus.SEARCHING,
      },
    });

    const hints = await this.matchingService.analyzeMissingPerson(record);

    const refreshed = await this.prisma.missingPerson.findUniqueOrThrow({
      where: { id: record.id },
    });

    return { record: refreshed, hints, alreadyExists: false };
  }

  private async findDuplicateReport(
    dto: CreateMissingPersonDto,
  ): Promise<MissingPerson | null> {
    if (dto.clientId) {
      const byClientId = await this.prisma.missingPerson.findFirst({
        where: { clientId: dto.clientId },
      });
      if (byClientId) return byClientId;
    }

    const name = dto.name.trim();
    const location = dto.lastKnownLocation.trim();

    const candidates = await this.prisma.missingPerson.findMany({
      where: {
        emergencyId: dto.emergencyId,
        name: { equals: name, mode: 'insensitive' },
        lastKnownLocation: { equals: location, mode: 'insensitive' },
        ...(dto.age != null ? { age: dto.age } : {}),
      },
      take: 1,
    });

    return candidates[0] ?? null;
  }

  private async ensureEmergencyExists(emergencyId: string): Promise<void> {
    const emergency = await this.prisma.emergency.findUnique({
      where: { id: emergencyId },
    });

    if (!emergency) {
      throw new NotFoundException('Emergencia no encontrada');
    }
  }

  private toResponse(
    record: MissingPerson,
    matchHints?: MissingPersonResponseDto['matchHints'],
    alreadyExists?: boolean,
  ): MissingPersonResponseDto {
    return {
      id: record.id,
      emergencyId: record.emergencyId,
      photoUrl: record.photoUrl,
      name: record.name,
      age: record.age,
      sex: record.sex,
      nationality: record.nationality,
      lastKnownLocation: record.lastKnownLocation,
      familyContact: record.familyContact,
      physicalDescription: record.physicalDescription,
      clothing: record.clothing,
      status: record.status,
      clientId: record.clientId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      matchHints,
      alreadyExists,
    };
  }
}
