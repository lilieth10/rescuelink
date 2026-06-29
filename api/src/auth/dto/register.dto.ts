import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'maria.gonzalez@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Maria' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName!: string;

  @ApiProperty({ example: 'Gonzalez' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  lastName!: string;

  @ApiProperty({ example: 'MiClaveSegura123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
