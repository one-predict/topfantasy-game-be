import { IsArray, IsString } from 'class-validator';
import { FantasyPointsSource, FantasyTargetCategory } from '@fantasy-targets/enums';
import { FantasyTargetTwitterStatistic } from '@fantasy-targets/types';

export class ListFantasyTargetsByIdsDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

export interface BaseFantasyTargetDto {
  id: string;
  category: FantasyTargetCategory;
  name: string;
  imageUrl: string;
  stars: number;
  socialLink: string;
  socialName: string;
  fantasyPoints7Days: number;
}

export interface TwitterFantasyTargetDto extends BaseFantasyTargetDto {
  pointsSource: FantasyPointsSource.Twitter;
  statistic7Days: FantasyTargetTwitterStatistic;
}

export type FantasyTargetDto = TwitterFantasyTargetDto;
