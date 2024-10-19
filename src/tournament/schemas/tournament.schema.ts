import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import TournamentPaymentCurrency from '@tournament/enums/tournament-payment-currency.enum';

@Schema()
export class Tournament {
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  title: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  description: string;

  @Prop({ required: false, type: mongoose.Schema.Types.String })
  imageUrl?: string;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  entryPrice: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  staticPrizePool: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  participantsCount: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  startTimestamp: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  endTimestamp: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  registrationEndTimestamp: number;

  @Prop({ required: false, default: TournamentPaymentCurrency.Coins, type: mongoose.Schema.Types.String })
  paymentCurrency: TournamentPaymentCurrency;

  @Prop([{ required: true, type: mongoose.Schema.Types.String }])
  availableFantasyTargets: string[];

  @Prop({ required: false, default: {}, type: mongoose.Schema.Types.Mixed })
  availableFantasyTargetsPoints: Record<string, number>;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);

TournamentSchema.index({ startTimestamp: 1, endTimestamp: 1 });
