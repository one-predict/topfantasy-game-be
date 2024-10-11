import { round } from 'lodash';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SortDirection } from '@common/enums';
import { ModeBasedCron } from '@common/decorators';
import { getCurrentUnixTimestamp, processCursor } from '@common/utils';
import { InjectUserService, UserService } from '@user';
import { InjectTokensOfferService, TokensOfferEntity, TokensOfferService } from '@offer';
import {
  getTournamentRoundByTimestamp,
  InjectTournamentDeckService,
  InjectTournamentParticipationService,
  InjectTournamentService,
  TournamentDeckService,
  TournamentParticipationService,
  TournamentService,
} from '@tournament';
import { InjectUserInventoryService, UserInventoryService } from '@inventory';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import {
  InjectCoinsHistoryService,
  CoinsHistoryService,
  CoinsHistoricalRecordEntity,
  CoinsHistoricalRecordSortField,
} from '@coin';
import { InjectPortfolioRepository } from '@portfolio/decorators';
import { FindPortfolioEntitiesQuery, PortfolioRepository } from '@portfolio/repositories';
import { PortfolioEntity } from '@portfolio/entities';
import { SelectedPortfolioToken } from '@portfolio/schemas';
import { PortfolioSortingField } from '@portfolio/enums';

export type ListPortfoliosParams = FindPortfolioEntitiesQuery;

export interface CreatePortfolioParams {
  userId: string;
  selectedTokens: SelectedPortfolioToken[];
  offerId: string;
}

export interface PortfolioService {
  list(params: ListPortfoliosParams): Promise<PortfolioEntity[]>;
  create(params: CreatePortfolioParams): Promise<PortfolioEntity>;
  applyCards(portfolioId: string, cardsStack: Record<string, number>, applierId?: string): Promise<PortfolioEntity>;
}

@Injectable()
export class PortfolioServiceImpl implements PortfolioService {
  private MAIN_GAME_COINS_MULTIPLIER = 20;

  constructor(
    @InjectPortfolioRepository() private readonly portfolioRepository: PortfolioRepository,
    @InjectTokensOfferService() private readonly tokensOfferService: TokensOfferService,
    @InjectCoinsHistoryService() private readonly coinsHistoryService: CoinsHistoryService,
    @InjectUserInventoryService() private readonly userInventoryService: UserInventoryService,
    @InjectTournamentService() private readonly tournamentService: TournamentService,
    @InjectTournamentParticipationService()
    private readonly tournamentParticipationService: TournamentParticipationService,
    @InjectUserService() private readonly userService: UserService,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
    @InjectTournamentDeckService() private readonly tournamentDeckService: TournamentDeckService,
  ) {}

  public list(params: ListPortfoliosParams) {
    return this.portfolioRepository.find(params);
  }

  public getById(id: string) {
    return this.portfolioRepository.findById(id);
  }

  public async getByIdIfExists(id: string) {
    const portfolio = await this.getById(id);

    if (!portfolio) {
      throw new NotFoundException('Portfolio is not found.');
    }

    return portfolio;
  }

  public async create(params: CreatePortfolioParams) {
    const offer = await this.tokensOfferService.getById(params.offerId);

    if (!offer) {
      throw new UnprocessableEntityException(`Provided offer doesn't exist.`);
    }

    const currentTimestamp = getCurrentUnixTimestamp();

    const offerTimestamp = offer.getTimestamp();
    const offerOpensAfterTimestamp = offer.getOpensAfterTimestamp();
    const offerDurationInSeconds = offer.getDurationInSeconds();

    if (currentTimestamp >= offerTimestamp || offerOpensAfterTimestamp > currentTimestamp) {
      throw new UnprocessableEntityException('Provided offer is not available.');
    }

    const user = await this.userService.getById(params.userId);

    if (!user) {
      throw new UnprocessableEntityException(`Provided user doesn't exist.`);
    }

    const tournamentId = offer.getTournamentId();

    const participation = tournamentId
      ? await this.tournamentParticipationService.getUserParticipationInTournament(user.getId(), tournamentId)
      : null;

    if (tournamentId && !participation) {
      throw new UnprocessableEntityException('User is not a participant of the tournament.');
    }

    const [existingPortfolio] = await this.portfolioRepository.find({
      filter: {
        userId: user.getId(),
        offerIds: [params.offerId],
      },
      limit: 1,
    });

    if (existingPortfolio) {
      throw new UnprocessableEntityException('Portfolio for this day already submitted.');
    }

    this.validateSelectedTokens(params.selectedTokens, offer);

    return this.portfolioRepository.createOne({
      user: params.userId,
      selectedTokens: params.selectedTokens,
      offer: params.offerId,
      tournament: tournamentId,
      intervalStartTimestamp: offerTimestamp,
      intervalEndTimestamp: offerTimestamp + offerDurationInSeconds,
      isAwarded: false,
    });
  }

  public applyCards(portfolioId: string, cardsStack: Record<string, number>, applierId?: string) {
    return this.transactionsManager.useTransaction(async () => {
      const portfolio = await this.getByIdIfExists(portfolioId);

      if (!portfolio.getTournamentId()) {
        throw new UnprocessableEntityException('Portfolio is not related to the tournament.');
      }

      const tournament = await this.tournamentService.getById(portfolio.getTournamentId());

      if (!tournament) {
        throw new UnprocessableEntityException("Tournament doesn't exist.");
      }

      if (applierId && portfolio.getUserId() !== applierId) {
        throw new UnprocessableEntityException("You can't apply cards to the portfolio of another user.");
      }

      const currentTimestamp = getCurrentUnixTimestamp();
      const [portfolioStartTimestamp] = portfolio.getInterval();

      if (currentTimestamp >= portfolioStartTimestamp) {
        throw new UnprocessableEntityException("You can't apply cards to this portfolio cause it's in live.");
      }

      const userInventory = await this.userInventoryService.getForUser(portfolio.getUserId());

      if (!userInventory) {
        throw new InternalServerErrorException("User inventory doesn't exists.");
      }

      const totalAppliedCards = Object.values(cardsStack).reduce((total, count) => total + count, 0);

      if (totalAppliedCards > userInventory.getAvailablePortfolioCardSlots()) {
        throw new UnprocessableEntityException('Not enough portfolio card slots.');
      }

      const portfolioRoundInTournament = getTournamentRoundByTimestamp(
        portfolioStartTimestamp,
        tournament.getStartTimestamp(),
        tournament.getRoundDurationInSeconds(),
      );

      await this.tournamentDeckService.updateUserDeckUsedCards(portfolio.getUserId(), portfolio.getTournamentId(), {
        cardsStack: cardsStack,
        round: portfolioRoundInTournament,
      });

      const updatedPortfolio = await this.portfolioRepository.updateOneById(portfolio.getId(), {
        appliedCardsStack: cardsStack,
      });

      if (!updatedPortfolio) {
        throw new NotFoundException('Portfolio is not found.');
      }

      return updatedPortfolio;
    });
  }

  @ModeBasedCron('*/30 * * * *')
  public async awardPortfolios() {
    const [latestCompletedCoinsHistoricalRecord] = await this.coinsHistoryService.list({
      filter: {
        completed: true,
      },
      sort: [
        {
          field: CoinsHistoricalRecordSortField.Timestamp,
          direction: SortDirection.Descending,
        },
      ],
      limit: 1,
    });

    if (!latestCompletedCoinsHistoricalRecord) {
      return;
    }

    const coinsHistoricalRecordsCache: Record<number, CoinsHistoricalRecordEntity> = {
      [latestCompletedCoinsHistoricalRecord.getTimestamp()]: latestCompletedCoinsHistoricalRecord,
    };

    const cursor = this.portfolioRepository.findAsCursor({
      filter: {
        isAwarded: false,
        intervalEndsBefore: latestCompletedCoinsHistoricalRecord.getTimestamp(),
      },
      sort: [
        {
          field: PortfolioSortingField.IntervalStartTimestamp,
          direction: SortDirection.Ascending,
        },
      ],
    });

    await processCursor<PortfolioEntity>(cursor, async (portfolios) => {
      const coinHistoricalTimestampsToLoadSet = portfolios.reduce((previousSet, portfolio) => {
        const [intervalStartTimestamp, intervalEndTimestamp] = portfolio.getInterval();

        if (!coinsHistoricalRecordsCache[intervalStartTimestamp]) {
          previousSet.add(intervalStartTimestamp);
        }

        if (!coinsHistoricalRecordsCache[intervalEndTimestamp]) {
          previousSet.add(intervalEndTimestamp);
        }

        return previousSet;
      }, new Set<number>());

      const coinsHistoricalRecords = await this.coinsHistoryService.list({
        filter: {
          timestamps: Array.from(coinHistoricalTimestampsToLoadSet),
        },
      });

      for (const coinsHistoricalRecord of coinsHistoricalRecords) {
        coinsHistoricalRecordsCache[coinsHistoricalRecord.getTimestamp()] = coinsHistoricalRecord;
      }

      for (const portfolio of portfolios) {
        try {
          const [intervalStartTimestamp, intervalEndTimestamp] = portfolio.getInterval();

          const intervalStartPrices = coinsHistoricalRecordsCache[intervalStartTimestamp].getPrices();
          const intervalEndPrices = coinsHistoricalRecordsCache[intervalEndTimestamp].getPrices();

          if (!intervalStartPrices || !intervalEndPrices) {
            continue;
          }

          const points = portfolio.getSelectedTokens().reduce((previousPoint, selectedToken) => {
            const startIntervalTokenPrice = intervalStartPrices[selectedToken.id];
            const endIntervalTokenPrice = intervalEndPrices[selectedToken.id];

            const percentage = ((endIntervalTokenPrice - startIntervalTokenPrice) / startIntervalTokenPrice) * 100;

            return previousPoint + (selectedToken.direction === 'falling' ? -percentage : percentage);
          }, 0);

          const roundedPoints = round(points, 2);

          await this.transactionsManager.useTransaction(async () => {
            const portfolioTournamentId = portfolio.getTournamentId();
            const portfolioUserId = portfolio.getUserId();

            const earnedCoins = portfolioTournamentId
              ? 0
              : Math.max(0, roundedPoints * this.MAIN_GAME_COINS_MULTIPLIER);

            const roundedEarnedCoins = round(earnedCoins, 2);

            await this.portfolioRepository.updateOneById(portfolio.getId(), {
              isAwarded: true,
              earnedCoins: roundedEarnedCoins,
              points: roundedPoints,
            });

            if (portfolioTournamentId) {
              await this.tournamentParticipationService.addPoints(
                portfolioUserId,
                portfolioTournamentId,
                roundedPoints,
              );
            }

            if (roundedEarnedCoins) {
              await this.userService.addCoins(portfolio.getUserId(), roundedEarnedCoins);
            }
          });
        } catch (error) {
          Logger.error(`Failed to award portfolio with ${portfolio.getId()} id: `, error);
        }
      }
    });
  }

  private validateSelectedTokens(selectedTokens: SelectedPortfolioToken[], offer: TokensOfferEntity) {
    const offerTokens = offer.getTokens();

    const hasInvalidTokens = selectedTokens.some((token) => {
      return !offerTokens.includes(token.id);
    });

    if (hasInvalidTokens) {
      throw new UnprocessableEntityException('Selected tokens are not valid for the offer.');
    }
  }
}
