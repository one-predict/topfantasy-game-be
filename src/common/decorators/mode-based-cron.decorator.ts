import { Cron, CronOptions } from '@nestjs/schedule';
import { getApplicationMode } from '@common/utils';
import { ApplicationMode } from '@common/enums';

export type ModeBasedCronOptions = CronOptions & {
  modes?: ApplicationMode[];
};

const DEFAULT_AVAILABLE_MODES = [ApplicationMode.Cron];

const ModeBasedCron = (
  cronName: string,
  { modes = DEFAULT_AVAILABLE_MODES, disabled, ...restOptions }: ModeBasedCronOptions = {},
) => {
  const isModeCompatible = modes.includes(getApplicationMode());
  console.log(isModeCompatible);
  return Cron(cronName, {
    ...restOptions,
    disabled: !isModeCompatible || !!disabled,
  } as CronOptions);
};

export default ModeBasedCron;
