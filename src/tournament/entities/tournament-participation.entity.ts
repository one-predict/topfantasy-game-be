import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { TournamentParticipation } from '@tournament/schemas';

export interface TournamentParticipationEntity {
  getId(): string;
  getTournamentId(): string;
  getUserId(): string;
  getSelectedFantasyTargetIds(): string[];
  getFantasyPoints(): number;
  getWalletAddress(): string;
}

export class MongoTournamentParticipationEntity implements TournamentParticipationEntity {
  constructor(
    private readonly tournamentParticipationDocument: FlattenMaps<TournamentParticipation> & {
      _id: ObjectId;
    },
  ) {}

  public getId() {
    return this.tournamentParticipationDocument._id.toString();
  }

  public getTournamentId() {
    return this.tournamentParticipationDocument.tournament.toString();
  }

  public getUserId() {
    return this.tournamentParticipationDocument.user.toString();
  }

  public getSelectedFantasyTargetIds() {
    return this.tournamentParticipationDocument.selectedFantasyTargets;
  }

  public getFantasyPoints() {
    return this.tournamentParticipationDocument.fantasyPoints;
  }

  public getWalletAddress() {
    return this.tournamentParticipationDocument.walletAddress;
  }
}
