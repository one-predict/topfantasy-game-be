import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '@core';
import { Tweet, TweetSchema } from '@twitter-stats/schemas';
import { TwitterStatsServiceImpl } from '@twitter-stats//services';
import { MongoTweetStatRepository } from '@twitter-stats/repositories';
import TwitterStatsTokens from './twitter-stats.module.tokens';
import { ProjectsModule } from '@projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tweet.name, schema: TweetSchema }]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreModule,
    ProjectsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: TwitterStatsTokens.Services.TwitterStatsService,
      useClass: TwitterStatsServiceImpl,
    },
    {
      provide: TwitterStatsTokens.Repositories.TweetRepository,
      useClass: MongoTweetStatRepository,
    },
  ],
  exports: [TwitterStatsTokens.Services.TwitterStatsService],
})
export class TwitterStatsModule {}
