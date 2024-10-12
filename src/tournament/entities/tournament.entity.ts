import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Tournament } from '@tournament/schemas';

export interface TournamentEntity {
  getId(): string;
  getTitle(): string;
  getDescription(): string;
  getEntryPrice(): number;
  getStaticPrizePool(): number;
  getParticipantsCount(): number;
  getStartTimestamp(): number;
  getEndTimestamp(): number;
  getRoundDurationInSeconds(): number;
  getImageUrl(): string | undefined;
  getIsTonConnected(): boolean;
  getCardsPool(): Array<string>;
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

  public getRoundDurationInSeconds() {
    return this.tournamentDocument.roundDurationInSeconds;
  }

  public getStartTimestamp() {
    return this.tournamentDocument.startTimestamp;
  }

  public getEndTimestamp() {
    return this.tournamentDocument.endTimestamp;
  }

  public getIsTonConnected() {
    return this.tournamentDocument.isTonConnected;
  }

  public getCardsPool() {
    return this.tournamentDocument.cardsPool;
  }
}
