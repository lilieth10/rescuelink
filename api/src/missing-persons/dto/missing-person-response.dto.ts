import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MissingPersonStatus, Sex } from '@prisma/client';
import { MatchHintDto } from './match-hint.dto';

export class MissingPersonResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  emergencyId!: string;

  @ApiPropertyOptional()
  photoUrl!: string | null;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  age!: number | null;

  @ApiProperty({ enum: Sex })
  sex!: Sex;

  @ApiPropertyOptional()
  nationality!: string | null;

  @ApiProperty()
  lastKnownLocation!: string;

  @ApiPropertyOptional()
  familyContact!: string | null;

  @ApiPropertyOptional()
  physicalDescription!: string | null;

  @ApiPropertyOptional()
  clothing!: string | null;

  @ApiProperty({ enum: MissingPersonStatus })
  status!: MissingPersonStatus;

  @ApiPropertyOptional({ description: 'Offline idempotency key' })
  clientId!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: [MatchHintDto] })
  matchHints?: MatchHintDto[];

  @ApiPropertyOptional({
    description: 'True si el reporte ya existía (mismo nombre, ubicación y edad)',
  })
  alreadyExists?: boolean;
}
