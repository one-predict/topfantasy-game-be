import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '@core';
import { FantasyTargetSchema, FantasyTarget } from './schemas';
import { DefaultFantasyTargetService } from './services';
import { FantasyTargetController } from './controllers';
import { MongoFantasyTargetRepository } from './repositories';
import { DefaultFantasyTargetEntityMapper } from './entities-mappers';
import FantasyTargetsModuleTokens from './fantasy-targets.module.tokens';

@Module({
  imports: [MongooseModule.forFeature([{ name: FantasyTarget.name, schema: FantasyTargetSchema }]), CoreModule],
  controllers: [FantasyTargetController],
  providers: [
    {
      provide: FantasyTargetsModuleTokens.Services.FantasyTargetService,
      useClass: DefaultFantasyTargetService,
    },
    {
      provide: FantasyTargetsModuleTokens.Repositories.FantasyTargetRepository,
      useClass: MongoFantasyTargetRepository,
    },
    {
      provide: FantasyTargetsModuleTokens.EntityMappers.FantasyTargetEntityMapper,
      useClass: DefaultFantasyTargetEntityMapper,
    },
  ],
  exports: [FantasyTargetsModuleTokens.Services.FantasyTargetService],
})
export class FantasyTargetsModule {}
