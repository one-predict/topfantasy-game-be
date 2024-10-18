import { round } from 'lodash';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TransactionsManager, InjectTransactionsManager } from '@core';
import { TweetRepository } from '@twitter-stats/repositories';
import { ModeBasedCron } from '@common/decorators';
import { MongoTweetEntity, TweetEntity } from '@twitter-stats/entities';
import { FantasyProjectService } from '@projects/services';
import { InjectFantasyProjectService } from '@projects/decorators';
import { InjectTweetRepository } from '@twitter-stats/decorators';
import { ApifyClient } from 'apify-client';
import { ConfigService } from '@nestjs/config';
import { Tweet } from '@twitter-stats/schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export interface CreateTwitterStatParams {
  quoteCount: number;
  replyCount?: number;
  favoriteCount?: number;
  retweetCount?: number;
  viewCount?: number;
  createdAt?: string;
  project?: string | number;
}

export interface TwitterStatsService {
  getById(id: string): Promise<TweetEntity | null>;
  getByProjectId(project: string | number): Promise<TweetEntity | null>;
  collectProjectTweetStats();
}

@Injectable()
export class TwitterStatsServiceImpl implements TwitterStatsService {
  private REFERRALS_REWARD = 500;
  private apifyClient: ApifyClient;

  constructor(
    @InjectFantasyProjectService() private readonly projectService: FantasyProjectService,
    @InjectTweetRepository() private readonly tweetRepository: TweetRepository,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
    @InjectModel(Tweet.name) private tweetModel: Model<Tweet>,
    private readonly configService: ConfigService,
  ) {
    this.apifyClient = new ApifyClient({ token: this.configService.get<string>('APIFY_API_TOKEN') });
  }

  public getById(id: string) {
    return this.tweetRepository.findById(id);
  }

  public async getByProjectId(projectId: string | number) {
    const tweets = await this.tweetRepository.findByProjectId(projectId);

    return tweets;
  }

  @ModeBasedCron('0 * * * *')
  public async collectProjectTweetStats() {
    const project = await this.projectService.list();

    project.map(async (project) => {
      const tweets = await this.apifyFetch(
        project.socialName,
        this.getDateTimeString(new Date(new Date().getTime() - 60 * 60 * 1000)),
        this.getDateTimeString(new Date()),
      );

      tweets.map(async (tweet) => {
        if (!tweet.id) {
          return;
        }

        const [tweetDocument] = await this.tweetModel.create([
          {
            project: project.socialName,
            retweetCount: tweet.retweetCount,
            replyCount: tweet.replyCount,
            favoriteCount: tweet.favoriteCount,
            likeCount: tweet.likeCount,
            viewCount: tweet.viewCount,
            createdAt: tweet.createdAt,
          },
        ]);

        await new MongoTweetEntity(tweetDocument);
      });
    });
  }

  private async apifyFetch(username: string, sinceDateTime: string, untilDateTime: string) {
    const input = {
      customMapFunction: '(object) => { return {...object} }',
      includeSearchTerms: false,
      onlyImage: false,
      onlyQuote: false,
      onlyTwitterBlue: false,
      onlyVerifiedUsers: false,
      onlyVideo: false,
      sort: 'Latest',
      tweetLanguage: 'en',
      searchTerms: [`(from:${username.replace('@', '')}) since:${sinceDateTime} until:${untilDateTime}`],
    };

    console.log(`(from:${username.replace('@', '')}) since:${sinceDateTime} until:${untilDateTime}`);

    const run = await this.apifyClient.actor(this.configService.get<string>('APIFY_ACTOR_ID')).call(input);

    const { items } = await this.apifyClient.dataset(run.defaultDatasetId).listItems();

    return items;
  }

  private getDateTimeString(date: Date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}_UTC`;
  }
}
