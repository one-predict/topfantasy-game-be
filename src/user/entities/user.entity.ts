import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from '@user/schemas';

export interface UserEntity {
  getId(): string;
  getExternalId(): string | number;
  getFirstName(): string | undefined;
  getLastName(): string | undefined;
  getUsername(): string | undefined;
  getAvatarUrl(): string | undefined;
  getCoinsBalance(): number;
  getTotalEarnedCoins(): number;
  getIsOnboarded(): boolean;
  getReferrerId(): string | undefined;
}

export class MongoUserEntity implements UserEntity {
  constructor(private readonly userDocument: FlattenMaps<User> & { _id: ObjectId }) {}

  public getId() {
    return this.userDocument._id.toString();
  }

  public getExternalId() {
    return this.userDocument.externalId;
  }

  public getUsername() {
    return this.userDocument.username;
  }

  public getFirstName() {
    return this.userDocument.firstName;
  }

  public getLastName() {
    return this.userDocument.lastName;
  }

  public getAvatarUrl() {
    return this.userDocument.avatarUrl;
  }

  public getCoinsBalance() {
    return this.userDocument.coinsBalance;
  }

  public getTotalEarnedCoins() {
    return this.userDocument.totalEarnedCoins;
  }

  public getIsOnboarded() {
    return this.userDocument.onboarded;
  }

  public getReferrerId() {
    return this.userDocument.referrer?.toString();
  }
}
