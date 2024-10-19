import { Inject } from '@nestjs/common';
import FantasyTargetsModuleTokens from '@fantasy-targets/fantasy-targets.module.tokens';

const InjectFantasyTargetService = () => {
  return Inject(FantasyTargetsModuleTokens.Services.FantasyTargetService);
};

export default InjectFantasyTargetService;
