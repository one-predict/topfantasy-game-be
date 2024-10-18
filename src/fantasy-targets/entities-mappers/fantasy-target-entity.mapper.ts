import { Injectable } from '@nestjs/common';
import { FantasyTargetEntity } from '@fantasy-targets/entities';
import { FantasyTargetDto } from '@fantasy-targets/dto';

export interface FantasyTargetEntityMapper {
  mapOne(entity: FantasyTargetEntity): FantasyTargetDto;
  mapMany(entities: FantasyTargetEntity[]): FantasyTargetDto[];
}

@Injectable()
export class DefaultFantasyTargetEntityMapper implements FantasyTargetEntityMapper {
  public mapOne(entity: FantasyTargetEntity): FantasyTargetDto {
    return {
      id: entity.getId(),
      category: entity.getCategory(),
      pointsSource: entity.getPointsSource(),
      imageUrl: entity.getImageUrl(),
      name: entity.getName(),
      stars: entity.getStars(),
      socialLink: entity.getSocialLink(),
      socialName: entity.getSocialName(),
      fantasyPoints7Days: entity.getFantasyPoints7Days(),
      statistic7Days: entity.getStatistic7Days(),
    } as FantasyTargetDto;
  }

  public mapMany(entities: FantasyTargetEntity[]): FantasyTargetDto[] {
    return entities.map((entity) => this.mapOne(entity));
  }
}
