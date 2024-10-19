import { round } from 'lodash';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TransactionsManager, InjectTransactionsManager } from '@core';
import { UserRepository } from '@user/repositories';
import { InjectUserRepository } from '@user/decorators';
import { UserEntity } from '@user/entities';

export interface CreateUserParams {
  externalId: string | number;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  coinsBalance?: number;
  referralId?: string | null;
}

export interface UpdateUserParams {
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  onboarded?: boolean;
}

export interface UserService {
  getById(id: string): Promise<UserEntity | null>;
  getByExternalId(externalId: string | number): Promise<UserEntity | null>;
  getByExternalIdIfExists(externalId: string | number): Promise<UserEntity>;
  create(params: CreateUserParams): Promise<UserEntity>;
  update(id: string, params: UpdateUserParams): Promise<UserEntity>;
  withdrawCoins(id: string, coins: number): Promise<void>;
  addCoins(id: string, coins: number): Promise<{ success: boolean }>;
}

@Injectable()
export class UserServiceImpl implements UserService {
  private REFERRALS_REWARD = 500;

  constructor(
    @InjectUserRepository() private readonly userRepository: UserRepository,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public getById(id: string) {
    return this.userRepository.findById(id);
  }

  public async getByExternalId(externalId: string | number) {
    const [user] = await this.userRepository.find({
      filter: {
        externalId,
      },
      limit: 1,
    });

    return user;
  }

  public async getByExternalIdIfExists(externalId: string | number) {
    const user = await this.getByExternalId(externalId);

    if (!user) {
      throw new NotFoundException('User is not found.');
    }

    return user;
  }

  public async create(params: CreateUserParams) {
    return this.transactionsManager.useTransaction(async () => {
      const initialCoinsBalance = params.coinsBalance ?? 0;

      const user = await this.userRepository.create({
        externalId: params.externalId,
        coinsBalance: params.referralId ? initialCoinsBalance + this.REFERRALS_REWARD : initialCoinsBalance,
        username: params.username,
        firstName: params.firstName,
        lastName: params.lastName,
        avatarUrl: params.avatarUrl,
        referrer: params.referralId,
      });

      // TODO Rewrite this to reward user using events system
      if (params.referralId) {
        await this.addCoins(params.referralId, this.REFERRALS_REWARD);
      }

      return user;
    });
  }

  public async update(id: string, params: UpdateUserParams) {
    const user = await this.userRepository.updateById(id, {
      ...(params.username ? { name: params.username } : {}),
      ...(params.firstName ? { firstName: params.firstName } : {}),
      ...(params.lastName ? { lastName: params.lastName } : {}),
      ...(params.avatarUrl ? { avatarUrl: params.avatarUrl } : {}),
      ...(params.onboarded !== undefined ? { onboarded: params.onboarded } : {}),
    });

    if (!user) {
      throw new NotFoundException('User is not found.');
    }

    return user;
  }

  public async addCoins(id: string, coins: number) {
    return this.transactionsManager.useTransaction(async () => {
      const user = await this.getById(id);

      if (!user) {
        return { success: false };
      }

      await this.userRepository.updateById(id, {
        coinsBalance: round(user.getCoinsBalance() + coins, 2),
        totalEarnedCoins: round(user.getTotalEarnedCoins() + coins, 2),
      });

      return { success: true };
    });
  }

  public async withdrawCoins(id: string, coins: number) {
    await this.transactionsManager.useTransaction(async () => {
      const user = await this.getById(id);

      if (!user) {
        throw new UnprocessableEntityException('Provided user is not found.');
      }

      if (user.getCoinsBalance() < coins) {
        throw new UnprocessableEntityException('Not enough balance');
      }

      await this.userRepository.updateById(id, {
        coinsBalance: round(user.getCoinsBalance() - coins, 2),
      });
    });
  }
}
