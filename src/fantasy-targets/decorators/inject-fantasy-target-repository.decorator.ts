import { Inject } from '@nestjs/common';
import FantasyTargetsModuleTokens from '@fantasy-targets/fantasy-targets.module.tokens';

const InjectFantasyTargetRepository = () => {
  return Inject(FantasyTargetsModuleTokens.Repositories.FantasyTargetRepository);
};

export default InjectFantasyTargetRepository;
