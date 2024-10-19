import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@common/guards';
import { FantasyTargetService } from '@fantasy-targets/services';
import { InjectFantasyTargetService } from '@fantasy-targets/decorators';
import { ListFantasyTargetsByIdsDto } from '@fantasy-targets/dto';
import { FantasyTargetCategory } from '@fantasy-targets/enums';

@Controller()
export default class FantasyTargetController {
  constructor(@InjectFantasyTargetService() private readonly fantasyTargetService: FantasyTargetService) {}

  @Get('/fantasy-targets')
  @UseGuards(AuthGuard)
  public async listFantasyTargets() {
    return this.fantasyTargetService.listByCategory(FantasyTargetCategory.Projects);
  }

  @Post('/fantasy-targets/by-ids-list')
  @UseGuards(AuthGuard)
  public async listFantasyTargetsByIds(@Body() body: ListFantasyTargetsByIdsDto) {
    return this.fantasyTargetService.listForIds(body.ids);
  }
}
