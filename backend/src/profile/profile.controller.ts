import { Controller, Get, Param, Headers, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { getPayload } from 'src/auth/utils';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getProfile(@Headers() headers) {
    try {
      const payload = getPayload(headers);
      const { user } = await this.profileService.getProfile(payload.login);
      if (user)
        return {
          error: null,
          body: {
            user,
            // TODO: add achienvements
            // TODO: add match history
          },
        };
      return { error: new Error('No user found!'), body: null };
    } catch (error) {
      return { error, body: null };
    }
  }

  @Get('editNickname')
  @UseGuards(AuthGuard)
  async editNickname(@Headers() headers, @Param() params) {
    try {
      const payload = getPayload(headers);
      await this.profileService.editProf(payload.login, params.newdata);
      return { error: null, body: null };
    } catch (error) {
      return { error, body: null };
    }
  }

  @Get('addAchievement')
  @UseGuards(AuthGuard)
  async addAchievement(@Headers() headers, @Param() params) {
    try {
      const payload = getPayload(headers);
      await this.profileService.addAchievement(
        payload.login,
        params.achievement,
      );
      return { error: null, body: null };
    } catch (error) {
      return { error, body: null };
    }
  }

  @Get('getAchievements')
  @UseGuards(AuthGuard)
  async getAchievements(@Headers() headers) {
    try {
      const payload = getPayload(headers);
      const achievements = await this.profileService.getAchievements(
        payload.login,
      );
      return { error: null, body: { achievements } };
    } catch (error) {
      return { error, body: null };
    }
  }
}