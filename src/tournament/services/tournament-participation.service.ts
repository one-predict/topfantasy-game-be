import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectUserService, UserService } from '@user';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { getCurrentUnixTimestamp } from '@common/utils';
import { EventsService } from '@events/services';
import { InjectEventsService } from '@events/decorators';
import { InjectTournamentParticipationRepository, InjectTournamentService } from '@tournament/decorators';
import { TournamentLeaderboard, TournamentParticipationRepository } from '@tournament/repositories';
import { TournamentService } from '@tournament/services';
import { TournamentParticipationEntity } from '@tournament/entities';
import {
  TournamentParticipationsEventType,
  TournamentPaymentCurrency,
  TournamentsEventCategory,
} from '@tournament/enums';
import { TournamentParticipationCreatedEventData } from '@tournament/types';

export interface CreateTournamentParticipationParams {
  userId: string;
  tournamentId: string;
  selectedFantasyTargetIds: string[];
  walletAddress?: string;
}

export interface TournamentParticipationService {
  create(params: CreateTournamentParticipationParams): Promise<void>;
  getUserRankForTournament(userId: string, tournamentId: string): Promise<number>;
  getUserParticipationInTournament(userId: string, tournamentId: string): Promise<TournamentParticipationEntity | null>;
  getLeaderboard(tournamentId: string): Promise<TournamentLeaderboard>;
  addPoints(userId: string, tournamentId: string, points: number): Promise<void>;
}

@Injectable()
export class TournamentParticipationServiceImpl implements TournamentParticipationService {
  constructor(
    @InjectTournamentParticipationRepository()
    private readonly tournamentParticipationRepository: TournamentParticipationRepository,
    @InjectTournamentService() private readonly tournamentService: TournamentService,
    @InjectUserService() private readonly userService: UserService,
    @InjectEventsService() private readonly eventsService: EventsService,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async getUserParticipationInTournament(userId: string, tournamentId: string) {
    const [tournamentParticipation] = await this.tournamentParticipationRepository.find({
      filter: {
        userId,
        tournamentId,
      },
      limit: 1,
    });

    return tournamentParticipation ?? null;
  }

  public async create(params: CreateTournamentParticipationParams) {
    await this.transactionsManager.useTransaction(async () => {
      const tournament = await this.tournamentService.getById(params.tournamentId);

      if (!tournament) {
        throw new UnprocessableEntityException(`Provided tournament doesn't exist.`);
      }

      const currentUnixTimestamp = getCurrentUnixTimestamp();
      const tournamentStartTimestamp = tournament.getStartTimestamp();
      const registrationEndTimestamp = tournament.getRegistrationEndTimestamp();

      if (currentUnixTimestamp > registrationEndTimestamp || currentUnixTimestamp < tournamentStartTimestamp) {
        throw new UnprocessableEntityException(`Registration in this tournament is not available.`);
      }

      const existingParticipation = await this.getUserParticipationInTournament(params.userId, params.tournamentId);

      if (existingParticipation) {
        throw new UnprocessableEntityException('User already participated in the tournament.');
      }

      if (tournament.getPaymentCurrency() === TournamentPaymentCurrency.Coins) {
        await this.userService.withdrawCoins(params.userId, tournament.getEntryPrice());
      }

      await this.tournamentService.addParticipant(params.tournamentId);

      const tournamentParticipation = await this.tournamentParticipationRepository.create({
        tournament: params.tournamentId,
        user: params.userId,
        fantasyPoints: 0,
        selectedFantasyTargets: params.selectedFantasyTargetIds,
        walletAddress: params.walletAddress,
      });

      await this.eventsService.create<TournamentParticipationCreatedEventData>({
        userId: params.userId,
        category: TournamentsEventCategory.Tournaments,
        type: TournamentParticipationsEventType.TournamentParticipationCreated,
        data: {
          object: {
            id: tournamentParticipation.getId(),
            tournamentId: tournamentParticipation.getTournamentId(),
            userId: tournamentParticipation.getUserId(),
            selectedFantasyTargetIds: tournamentParticipation.getSelectedFantasyTargetIds(),
            fantasyPoints: tournamentParticipation.getFantasyPoints(),
          },
        },
        meta: {
          tournamentPrice: tournament.getEntryPrice(),
        },
      });
    });
  }

  public getLeaderboard(tournamentId: string) {
    return this.tournamentParticipationRepository.getLeaderboard(tournamentId);
  }

  public async getUserRankForTournament(userId: string, tournamentId: string) {
    return this.tournamentParticipationRepository.getRank(tournamentId, userId);
  }

  public async addPoints(userId: string, tournamentId: string, points: number) {
    await this.tournamentParticipationRepository.addPoints(userId, tournamentId, points);
  }
}
