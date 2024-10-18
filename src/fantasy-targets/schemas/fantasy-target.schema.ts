import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { FantasyPointsSource, FantasyTargetCategory } from '@fantasy-targets/enums';
import { FantasyTargetStatistic } from '@fantasy-targets/types';

export type FantasyTargetDocument = HydratedDocument<FantasyTarget>;

@Schema({ collection: 'fantasy_targets', _id: false })
export class FantasyTarget {
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  _id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  category: FantasyTargetCategory;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  pointsSource: FantasyPointsSource;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  name: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  imageUrl: string;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  stars: number;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  socialName: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  socialLink: string;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  fantasyPoints7Days: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  statistic7Days: FantasyTargetStatistic;
}

export const FantasyTargetSchema = SchemaFactory.createForClass(FantasyTarget);

FantasyTargetSchema.index({ category: 1, fantasyPoints7Days: -1 });
