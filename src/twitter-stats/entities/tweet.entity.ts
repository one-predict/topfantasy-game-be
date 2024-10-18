import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Tweet } from '@twitter-stats/schemas';

export interface TweetEntity {
  getId(): string;
  getRetweetCount(): number;
  getReplyCount(): number;
  getFavoriteCount(): number;
  getLikeCount(): number;
  getViewCount(): number;
  getCreatedAt(): string;
  getProjectId(): string;
}

export class MongoTweetEntity implements TweetEntity {
  constructor(private readonly tweetDocument: FlattenMaps<Tweet> & { _id: ObjectId }) {}

  public getId() {
    return this.tweetDocument._id.toString();
  }

  public getRetweetCount() {
    return this.tweetDocument.retweetCount;
  }

  public getReplyCount() {
    return this.tweetDocument.replyCount;
  }

  public getFavoriteCount() {
    return this.tweetDocument.favoriteCount;
  }

  public getLikeCount() {
    return this.tweetDocument.likeCount;
  }

  public getViewCount() {
    return this.tweetDocument.viewCount;
  }

  public getCreatedAt() {
    return this.tweetDocument.createdAt;
  }

  public getProjectId() {
    return this.tweetDocument.project;
  }
}
