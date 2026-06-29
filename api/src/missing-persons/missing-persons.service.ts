import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MissingPerson, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMissingPersonDto } from './dto/create-missing-person.dto';
import { MissingPersonResponseDto } from './dto/missing-person-response.dto';
import { QueryMissingPersonsDto } from './dto/query-missing-persons.dto';

@Injectable()
export class MissingPersonsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return records.map((record) => this.toResponse(record));
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
    await this.ensureEmergencyExists(dto.emergencyId);

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
      },
    });

    return this.toResponse(record);
  }

  private async ensureEmergencyExists(emergencyId: string): Promise<void> {
    const emergency = await this.prisma.emergency.findUnique({
      where: { id: emergencyId },
    });

    if (!emergency) {
      throw new NotFoundException('Emergencia no encontrada');
    }
  }

  private toResponse(record: MissingPerson): MissingPersonResponseDto {
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
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
