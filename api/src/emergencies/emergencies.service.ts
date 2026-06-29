import { Injectable, NotFoundException } from '@nestjs/common';
import { EmergencyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyResponseDto } from './dto/emergency-response.dto';

@Injectable()
export class EmergenciesService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(): Promise<EmergencyResponseDto[]> {
    const emergencies = await this.prisma.emergency.findMany({
      where: { status: EmergencyStatus.ACTIVE },
      include: {
        country: { select: { code: true, name: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    return emergencies.map((emergency) => this.toResponse(emergency));
  }

  async findById(id: string): Promise<EmergencyResponseDto> {
    const emergency = await this.prisma.emergency.findUnique({
      where: { id },
      include: {
        country: { select: { code: true, name: true } },
      },
    });

    if (!emergency) {
      throw new NotFoundException('Emergencia no encontrada');
    }

    return this.toResponse(emergency);
  }

  private toResponse(emergency: {
    id: string;
    name: string;
    type: EmergencyResponseDto['type'];
    status: EmergencyResponseDto['status'];
    startDate: Date;
    endDate: Date | null;
    country: { code: string; name: string };
  }): EmergencyResponseDto {
    return {
      id: emergency.id,
      name: emergency.name,
      type: emergency.type,
      status: emergency.status,
      startDate: emergency.startDate,
      endDate: emergency.endDate,
      country: emergency.country,
    };
  }
}
