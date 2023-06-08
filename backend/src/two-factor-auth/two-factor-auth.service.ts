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
      const otpauthUrl = speakeasy.otpauthURL({
        secret: secret.ascii,
        label: `htumanya's ft_transcendence`,
        algorithm: 'sha1',
      });
      const user = await this.userRepo.findOne({ where: { login } });
      user.two_factor_token = secret.ascii;
      user.save();
      const qrCode = await QRCode.toDataURL(otpauthUrl);
      return { secret: secret.ascii, qrCode };
    } catch (err) {
      throw err;
    }
  }

  async enableTwoFactor(login: string) {
    try {
      const user = await this.userRepo.findOne({ where: { login: login } });
      user.is2fa = true;
      await this.userRepo.save(user);
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
