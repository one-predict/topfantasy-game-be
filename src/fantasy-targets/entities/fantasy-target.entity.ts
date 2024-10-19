import { FlattenMaps } from 'mongoose';
import { FantasyTarget } from '@fantasy-targets/schemas';
import { FantasyPointsSource, FantasyTargetCategory } from '@fantasy-targets/enums';
import { FantasyTargetStatistic } from '@fantasy-targets/types';

export interface FantasyTargetEntity {
  getId(): string;
  getCategory(): FantasyTargetCategory;
  getPointsSource(): FantasyPointsSource;
  getName(): string;
  getStars(): number;
  getSocialLink(): string;
  getSocialName(): string;
  getImageUrl(): string;
  getFantasyPoints7Days(): number;
  getStatistic7Days(): FantasyTargetStatistic;
}

export class MongoFantasyTargetEntity implements FantasyTargetEntity {
  constructor(private readonly fantasyTarget: FlattenMaps<FantasyTarget> & { _id: string }) {}

  public getId() {
    return this.fantasyTarget._id;
  }

  public getCategory() {
    return this.fantasyTarget.category;
  }

  public getPointsSource() {
    return this.fantasyTarget.pointsSource;
  }

  public getName() {
    return this.fantasyTarget.name;
  }

  public getStars() {
    return this.fantasyTarget.stars;
  }

  public getSocialLink() {
    return this.fantasyTarget.socialLink;
  }

  public getSocialName() {
    return this.fantasyTarget.socialName;
  }

  public getImageUrl() {
    return this.fantasyTarget.imageUrl;
  }

  public getFantasyPoints7Days() {
    return this.fantasyTarget.fantasyPoints7Days;
  }

  public getStatistic7Days() {
    return this.fantasyTarget.statistic7Days;
  }
}
