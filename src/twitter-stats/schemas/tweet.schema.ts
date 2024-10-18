import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';

export type TweetDocument = HydratedDocument<Tweet>;

@Schema()
export class Tweet {
  @Prop({ required: true, type: mongoose.Schema.Types.Number, default: 0 })
  retweetCount: number;

  @Prop({ required: false, type: mongoose.Schema.Types.Number, default: 0 })
  replyCount: number;

  @Prop({ required: false, type: mongoose.Schema.Types.Number, default: 0 })
  favoriteCount: number;

  @Prop({ required: false, type: mongoose.Schema.Types.Number, default: 0 })
  likeCount: number;

  @Prop({ required: false, type: mongoose.Schema.Types.Number, default: 0 })
  viewCount: number;

  @Prop({ required: false, type: mongoose.Schema.Types.String })
  createdAt: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  project: string;
}

export const TweetSchema = SchemaFactory.createForClass(Tweet);
