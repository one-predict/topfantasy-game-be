import { Inject } from '@nestjs/common';
import TwitterStatsModuleTokens from '@twitter-stats/twitter-stats.module.tokens';

const InjectTweetRepository = () => {
  return Inject(TwitterStatsModuleTokens.Repositories.TweetRepository);
};

export default InjectTweetRepository;
