import { Controller, Get, Req, Headers, UseGuards } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { getPayload } from 'src/utils/auth.utils';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('auth/two-factor')
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getHello(@Req() req, @Headers() headers): Promise<any> {
    const payload = getPayload(headers);
    const { secret, qrCode } = await this.twoFactorAuthService.generateSecret(
      payload.login,
    );
    headers['authroization'] = secret;
    return { error: null, body: { qrCode } };
  }

  @Get('enable')
  @UseGuards(AuthGuard)
  async enableTwoFactor(@Req() req): Promise<any> {
    const payload = getPayload(req.headers);
    const { token } = req.query;
    const isTokenValid = await this.twoFactorAuthService.verifyToken(
      token,
      payload.login,
    );
    if (isTokenValid) {
      await this.twoFactorAuthService.enableTwoFactor(payload.login);
      return { error: null, body: null };
    }
    return { error: new Error('Invalid token!'), body: null };
  }

  @Get('verify')
  @UseGuards(AuthGuard)
  async verifyToken(@Req() req): Promise<any> {
    const { token } = req.query;
    const payload = getPayload(req.headers);
    const isTokenValid = await this.twoFactorAuthService.verifyToken(
      token,
      payload.login,
    );
    return { error: null, body: { isTokenValid } };
  }

  @Get('remove')
  @UseGuards(AuthGuard)
  async removeToken(@Req() req): Promise<any> {
    try {
      const payload = getPayload(req.headers);
      await this.twoFactorAuthService.removeTwoFactor(payload.login);
      return { error: null, body: null };
    } catch (err) {
      return { error: err, body: null };
    }
  }
}
