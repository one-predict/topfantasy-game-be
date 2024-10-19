import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Tournament } from '@tournament/schemas';
import { TournamentPaymentCurrency } from '@tournament/enums';

export interface TournamentEntity {
  getId(): string;
  getTitle(): string;
  getDescription(): string;
  getEntryPrice(): number;
  getStaticPrizePool(): number;
  getParticipantsCount(): number;
  getStartTimestamp(): number;
  getEndTimestamp(): number;
  getRegistrationEndTimestamp(): number;
  getImageUrl(): string | undefined;
  getPaymentCurrency(): TournamentPaymentCurrency;
  getAvailableFantasyTargetIds(): Array<string>;
  getAvailableFantasyTargetsPoints(): Record<string, number>;
}

export class MongoTournamentEntity implements TournamentEntity {
  constructor(private readonly tournamentDocument: FlattenMaps<Tournament> & { _id: ObjectId }) {}

  public getId() {
    return this.tournamentDocument._id.toString();
  }

  public getTitle() {
    return this.tournamentDocument.title;
  }

  public getImageUrl() {
    return this.tournamentDocument.imageUrl;
  }

  public getDescription() {
    return this.tournamentDocument.description;
  }

  public getEntryPrice() {
    return this.tournamentDocument.entryPrice;
  }

  public getStaticPrizePool() {
    return this.tournamentDocument.staticPrizePool;
  }

  public getParticipantsCount() {
    return this.tournamentDocument.participantsCount;
  }

  public getRegistrationEndTimestamp() {
    return this.tournamentDocument.registrationEndTimestamp;
  }

  public getStartTimestamp() {
    return this.tournamentDocument.startTimestamp;
  }

  public getEndTimestamp() {
    return this.tournamentDocument.endTimestamp;
  }

  public getPaymentCurrency() {
    return this.tournamentDocument.paymentCurrency;
  }

  public getAvailableFantasyTargetIds() {
    return this.tournamentDocument.availableFantasyTargets;
  }

  public getAvailableFantasyTargetsPoints() {
    return this.tournamentDocument.availableFantasyTargetsPoints;
  }
}
