import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { RuleBasedMatchScorer } from './scorers/rule-based-match.scorer';

@Module({
  providers: [MatchingService, RuleBasedMatchScorer],
  exports: [MatchingService],
})
export class MatchingModule {}
