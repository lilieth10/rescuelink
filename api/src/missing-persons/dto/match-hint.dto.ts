import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MatchHintDto {
  @ApiProperty()
  candidateId!: string;

  @ApiProperty()
  candidateName!: string;

  @ApiProperty({ description: 'Score between 0 and 1' })
  score!: number;

  @ApiProperty({ type: [String] })
  reasons!: string[];
}
