import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async getAuth(@Query() query) {
    try {
      const userInfo: any = await this.authService.auth42(
        query.code,
        query.state,
      );
      if (!(await this.authService.checkUser(userInfo.login))) {
        this.authService.createUser(userInfo);
      }
      this.authService.loginUser(userInfo);
      return userInfo;
    } catch (err) {
      return null;
    }
  }
}
