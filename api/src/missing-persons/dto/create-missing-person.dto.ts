import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MissingPersonStatus, Sex } from '@prisma/client';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsContactPhone } from '../../common/validators/is-contact-phone.validator';

export class CreateMissingPersonDto {
  @ApiProperty({ example: 'ven-earthquake-2026' })
  @IsString()
  @IsNotEmpty()
  emergencyId!: string;

  @ApiProperty({ example: 'María González' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 34 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(130)
  age?: number;

  @ApiPropertyOptional({ enum: Sex })
  @IsOptional()
  sex?: Sex;

  @ApiProperty({ example: 'Av. Libertador, Caracas' })
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  lastKnownLocation!: string;

  @ApiPropertyOptional({ example: '0412 123 4567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsContactPhone()
  familyContact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  physicalDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  clothing?: string;

  @ApiPropertyOptional({ description: 'Offline client UUID for sync' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  clientId?: string;
}
