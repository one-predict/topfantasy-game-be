import { Injectable } from '@nestjs/common';
import { InjectFantasyTargetEntityMapper, InjectFantasyTargetRepository } from '@fantasy-targets/decorators';
import { FantasyTargetRepository } from '@fantasy-targets/repositories';
import { FantasyTargetDto } from '@fantasy-targets/dto';
import { FantasyTargetEntityMapper } from '@fantasy-targets/entities-mappers';
import { FantasyTargetCategory } from '@fantasy-targets/enums';
import { FantasyTargetStatistic } from "@fantasy-targets/types";

export interface UpdateFantasyTargetParams {
  stars?: number;
  fantasyPoints7Day?: number;
  statistic7Day?: FantasyTargetStatistic;
}

export interface FantasyTargetService {
  listByCategory(category: FantasyTargetCategory): Promise<FantasyTargetDto[]>;
  listForIds(ids: string[]): Promise<FantasyTargetDto[]>;
  getById(id: string): Promise<FantasyTargetDto>;
  update(id: string, params: UpdateFantasyTargetParams): Promise<void>;
}

@Injectable()
export class DefaultFantasyTargetService implements FantasyTargetService {
  constructor(
    @InjectFantasyTargetRepository() private readonly fantasyTargetRepository: FantasyTargetRepository,
    @InjectFantasyTargetEntityMapper() private readonly fantasyTargetEntityMapper: FantasyTargetEntityMapper,
  ) {}

  public async listByCategory(category: FantasyTargetCategory) {
    const targets = await this.fantasyTargetRepository.findByCategory(category);

    return this.fantasyTargetEntityMapper.mapMany(targets);
  }

  public async listForIds(ids: string[]) {
    const targets = await this.fantasyTargetRepository.findByIds(ids);

    return this.fantasyTargetEntityMapper.mapMany(targets);
  }

  public async getById(id: string) {
    const target = await this.fantasyTargetRepository.findById(id);

    return this.fantasyTargetEntityMapper.mapOne(target);
  }

  public async update(id, params: UpdateFantasyTargetParams) {
    await this.fantasyTargetRepository.updateOneById(id, {
      stars: params.stars,
      statistic7Days: params.statistic7Day,
      fantasyPoints7Days: params.fantasyPoints7Day,
    });
  }
}
