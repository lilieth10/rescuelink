import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MissingPersonStatus, Sex } from '@prisma/client';

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

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
