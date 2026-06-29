import { ApiPropertyOptional } from '@nestjs/swagger';
import { MissingPersonStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class QueryMissingPersonsDto {
  @ApiPropertyOptional({ example: 'ven-earthquake-2026' })
  @IsString()
  @IsNotEmpty()
  emergencyId!: string;

  @ApiPropertyOptional({ example: 'María' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ enum: MissingPersonStatus })
  @IsOptional()
  @IsEnum(MissingPersonStatus)
  status?: MissingPersonStatus;
}
