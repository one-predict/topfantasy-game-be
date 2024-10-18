import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { FantasyTarget } from '@fantasy-targets/schemas';
import { FantasyTargetEntity, MongoFantasyTargetEntity } from '@fantasy-targets/entities';
import { FantasyTargetCategory } from '@fantasy-targets/enums';

export interface FantasyTargetRepository {
  findByCategory(category: FantasyTargetCategory): Promise<FantasyTargetEntity[]>;
  findByIds(ids: string[]): Promise<FantasyTargetEntity[]>;
  findById(id: string): Promise<FantasyTargetEntity>;
}

@Injectable()
export class MongoFantasyTargetRepository implements FantasyTargetRepository {
  public constructor(
    @InjectModel(FantasyTarget.name) private fantasyTargetModel: Model<FantasyTarget>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findByCategory(category: FantasyTargetCategory) {
    const targets = await this.fantasyTargetModel
      .find(
        {
          category,
        },
        undefined,
        {
          sort: { fantasyPoints7Days: -1 },
          session: this.transactionsManager.getSession(),
          lean: true,
        },
      )
      .exec();

    return targets.map((target) => {
      return new MongoFantasyTargetEntity(target);
    });
  }

  public async findByIds(ids: string[]) {
    const targets = await this.fantasyTargetModel
      .find({ _id: { $in: ids } })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return targets.map((target) => {
      return new MongoFantasyTargetEntity(target);
    });
  }

  public async findById(id: string) {
    const target = await this.fantasyTargetModel
      .findOne({
        _id: id,
      })
      .lean()
      .session(this.transactionsManager.getSession())
      .exec();

    return target && new MongoFantasyTargetEntity(target);
  }
}
