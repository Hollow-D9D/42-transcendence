import {
  Controller,
  Get,
  Query,
  UseGuards,
  Headers,
  // Redirect,
} from '@nestjs/common';
import { getPayload } from './utils';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  /**
   * need to uncomment Redirect decorator first
   */
  // @Redirect('to some react app page!!!', 302)
  async getAuth(@Query() query) {
    try {
      const userInfo: any = await this.authService.auth42(
        query.code,
        query.state,
      );
      if (!(await this.authService.checkUser(userInfo.login))) {
        this.authService.createUser(userInfo);
      }
      return await this.authService.loginUser(userInfo);
    } catch (err) {
      return {
        error: err,
        body: null,
      };
    }
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  async getLogout(@Headers() headers) {
    try {
      const payload = getPayload(headers);
      return this.authService.logoutUser(payload.login);
    } catch (err) {
      return {
        error: err,
        body: null,
      };
    }
  }
}
