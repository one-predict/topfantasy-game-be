import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

@Schema({ collection: 'tournament_participations', minimize: false })
export class TournamentParticipation {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  tournament: ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: ObjectId;

  @Prop([{ required: true, type: mongoose.Schema.Types.String }])
  selectedFantasyTargets: string[];

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  fantasyPoints: number;

  @Prop({ required: false, type: mongoose.Schema.Types.String })
  walletAddress: string;
}

export const TournamentParticipationSchema = SchemaFactory.createForClass(TournamentParticipation);

TournamentParticipationSchema.index({ user: 1, tournament: 1 }, { unique: true });
TournamentParticipationSchema.index({ tournament: 1, fantasyPoints: -1, _id: 1 });
