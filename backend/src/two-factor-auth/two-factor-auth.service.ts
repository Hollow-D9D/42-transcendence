import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User } from 'src/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}
  async generateSecret(login: string): Promise<any> {
    try {
      const secret = speakeasy.generateSecret();
      let secretCode = secret.ascii;

      const user = await this.userRepo.findOne({ where: { login } });
      if (!user.two_factor_token)
        user.two_factor_token = secretCode;
      else
        secretCode = user.two_factor_token;
      user.save();

      const otpauthUrl = speakeasy.otpauthURL({
        secret: secretCode,
        label: `htumanya's ft_transcendence`,
        algorithm: 'sha1',
      });
      const qrCode = await QRCode.toDataURL(otpauthUrl);
      return { secret: secretCode, qrCode };
    } catch (err) {
      throw err;
    }
  }

  async removeTwoFactor(login: string) {
    try {
      const user = await this.userRepo.findOne({ where: { login: login } });
      user.two_factor_token = null;
      await this.userRepo.save(user);
      return {
        error: null,
        body: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async verifyToken(token: string, login: string): Promise<boolean> {
    try {
      const user = await this.userRepo.findOne({ where: { login: login } });
      return speakeasy.totp.verify({
        secret: user.two_factor_token,
        encoding: 'ascii',
        token,
        window: 1,
      });
    } catch (err) {
      throw err;
    }
  }
}
