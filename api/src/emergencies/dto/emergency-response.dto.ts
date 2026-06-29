import { ApiProperty } from '@nestjs/swagger';
import { EmergencyStatus, EmergencyType } from '@prisma/client';

export class EmergencyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: EmergencyType })
  type!: EmergencyType;

  @ApiProperty({ enum: EmergencyStatus })
  status!: EmergencyStatus;

  @ApiProperty()
  startDate!: Date;

  @ApiProperty({ nullable: true })
  endDate!: Date | null;

  @ApiProperty()
  country!: {
    code: string;
    name: string;
  };
}
