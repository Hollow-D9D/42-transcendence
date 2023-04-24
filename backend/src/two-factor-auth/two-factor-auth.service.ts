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
        algorithm: 'sha1', // TODO: use a more up-to-date algorithm
      });
      const user = await this.userRepo.findOne({ where: { login } });
      // TODO: the secret stored in the db is unencrypted which should be fixed
      user.two_factor_token = secret.ascii;
      user.save();
      const qrCode = await QRCode.toDataURL(otpauthUrl);
      return { secret: secret.ascii, qrCode };
    } catch (err) {
      throw err;
    }
  }

  async removeTwoFactor(login: string) {
    try {
      const user = await this.userRepo.findOne({ where: { login: login } });
      user.two_factor_token = null;
      await this.userRepo.save(user);
      // TODO: there's no need to return anything, the return value is not used
      // is the controller anyway
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
        // TODO: should get decrypted here (after an encrypted version is stored above)
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
