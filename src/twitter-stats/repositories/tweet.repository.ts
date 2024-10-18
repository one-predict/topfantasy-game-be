import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { FindEntitiesQuery } from '@common/types';
import { transformSortArrayToSortObject } from '@common/utils';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { Tweet } from '@twitter-stats/schemas';
import { TweetEntity, MongoTweetEntity } from '@twitter-stats/entities';

export type FindTweetEntitiesQuery = FindEntitiesQuery<{
  project?: string;
}>;

interface CreateTweetEntityParams {
  quoteCount?: number;
  replyCount?: number;
  favoriteCount?: number;
  retweetCount?: number;
  viewCount?: number;
  createdAt?: number;
  project?: string;
}

export interface TweetRepository {
  find(query: FindTweetEntitiesQuery): Promise<TweetEntity[]>;
  findById(id: string | number): Promise<TweetEntity>;
  findByProjectId(project: string | number): Promise<TweetEntity | null>;
  create(params: CreateTweetEntityParams): Promise<TweetEntity>;
}

@Injectable()
export class MongoTweetStatRepository implements TweetRepository {
  public constructor(
    @InjectModel(Tweet.name) private readonly tweetModel: Model<Tweet>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async find(query: FindTweetEntitiesQuery) {
    const mongodbQueryFilter: FilterQuery<Tweet> = {};

    const tweets = await this.tweetModel
      .find(mongodbQueryFilter, undefined, {
        lean: true,
        limit: query.limit,
        skip: query.skip,
        sort: query.sort && transformSortArrayToSortObject(query.sort),
        session: this.transactionsManager.getSession(),
      })
      .exec();

    return tweets.map((tweet) => new MongoTweetEntity(tweet));
  }

  public async findById(id: string) {
    const tweet = await this.tweetModel
      .findOne({ _id: new ObjectId(id) })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return tweet && new MongoTweetEntity(tweet);
  }

  public async findByProjectId(id: string | number) {
    const tweet = await this.tweetModel
      .findOne({ _id: new ObjectId(id) })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return tweet && new MongoTweetEntity(tweet);
  }

  public async create(params: CreateTweetEntityParams) {
    const [tweet] = await this.tweetModel.create([params], {
      session: this.transactionsManager.getSession(),
    });

    return new MongoTweetEntity(tweet);
  }
}
