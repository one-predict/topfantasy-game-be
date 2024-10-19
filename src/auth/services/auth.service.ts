import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectUserService, UserEntity, UserService } from '@user';
import { ConfigService } from '@nestjs/config';
import { RegistrationService } from '@auth/services';
import { getTelegramInitDataFromSignInMessage, verifyTelegramSignInMessage } from '@auth/utils';
import { InjectRegistrationService } from '@auth/decorators';

export interface SignInTemplateUser {
  signInMessage: string;
  referralId?: string;
}

export interface AuthService {
  signInTelegramUser(params: SignInTemplateUser): Promise<UserEntity>;
}

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @InjectUserService() private readonly userService: UserService,
    @InjectRegistrationService() private readonly registrationService: RegistrationService,
    private readonly configService: ConfigService,
  ) {}

  public async signInTelegramUser(params: SignInTemplateUser) {
    const initData = getTelegramInitDataFromSignInMessage(params.signInMessage);

    const isMessageValid = verifyTelegramSignInMessage(
      params.signInMessage,
      this.configService.get('TELEGRAM_BOT_TOKEN'),
    );

    if (!isMessageValid || !initData.user) {
      throw new ForbiddenException('Authorization failed.');
    }

    const user = await this.userService.getByExternalId(initData.user.id);

    if (!user) {
      return this.registrationService.register({
        externalId: initData.user.id,
        userName: initData.user.username,
        firstName: initData.user.first_name,
        lastName: initData.user.last_name,
        avatarUrl: initData.user.photo_url,
        referralId: params.referralId,
      });
    }

    if (
      (user.getUsername() !== initData.user.username && initData.user.username) ||
      (user.getFirstName() !== initData.user.first_name && initData.user.first_name) ||
      (user.getLastName() !== initData.user.last_name && initData.user.last_name) ||
      (user.getAvatarUrl() !== initData.user.photo_url && initData.user.photo_url)
    ) {
      return this.userService.update(user.getId(), {
        username: initData.user.username,
        firstName: initData.user.first_name,
        lastName: initData.user.last_name,
        avatarUrl: initData.user.photo_url,
      });
    }

    return user;
  }
}
