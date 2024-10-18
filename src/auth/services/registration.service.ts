import { Injectable } from '@nestjs/common';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { InjectUserService, UserEntity, UserService } from '@user';

export interface RegisterUserParams {
  externalId: string | number;
  userName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  referralId?: string;
}

export interface RegistrationService {
  register(params: RegisterUserParams): Promise<UserEntity>;
}

@Injectable()
export class DefaultRegistrationService implements RegistrationService {
  private INITIAL_COINS_BALANCE = 1000;

  constructor(
    @InjectUserService() private readonly userService: UserService,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async register(params: RegisterUserParams) {
    return this.transactionsManager.useTransaction(async () => {
      return this.userService.create({
        externalId: params.externalId,
        username: params.userName,
        firstName: params.firstName,
        lastName: params.lastName,
        avatarUrl: params.avatarUrl,
        referralId: params.referralId,
        coinsBalance: this.INITIAL_COINS_BALANCE,
      });
    });
  }
}
