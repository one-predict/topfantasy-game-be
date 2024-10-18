import { Inject } from '@nestjs/common';
import TwitterStatsModuleTokens from '@twitter-stats/twitter-stats.module.tokens';

const InjectTwitterStatsService = () => {
  return Inject(TwitterStatsModuleTokens.Services.TwitterStatsService);
};

export default InjectTwitterStatsService;
