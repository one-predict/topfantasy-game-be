import { Injectable } from '@nestjs/common';
import { InjectFantasyTargetEntityMapper, InjectFantasyTargetRepository } from '@fantasy-targets/decorators';
import { FantasyTargetRepository } from '@fantasy-targets/repositories';
import { FantasyTargetDto } from '@fantasy-targets/dto';
import { FantasyTargetEntityMapper } from '@fantasy-targets/entities-mappers';
import { FantasyTargetCategory } from '@fantasy-targets/enums';

export interface FantasyTargetService {
  listByCategory(category: FantasyTargetCategory): Promise<FantasyTargetDto[]>;
  listForIds(ids: string[]): Promise<FantasyTargetDto[]>;
  getById(id: string): Promise<FantasyTargetDto>;
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
}
