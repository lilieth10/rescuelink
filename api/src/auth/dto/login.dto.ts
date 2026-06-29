import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@rescuelink.org' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'RescueLink2026!' })
  @IsString()
  @MinLength(8)
  password!: string;
}
