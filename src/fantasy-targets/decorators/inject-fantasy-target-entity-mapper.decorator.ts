import { Inject } from '@nestjs/common';
import FantasyTargetsModuleTokens from '@fantasy-targets/fantasy-targets.module.tokens';

const InjectFantasyTargetEntityMapper = () => {
  return Inject(FantasyTargetsModuleTokens.EntityMappers.FantasyTargetEntityMapper);
};

export default InjectFantasyTargetEntityMapper;
