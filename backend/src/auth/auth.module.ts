import { Module, CacheModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorAuthService } from 'src/two-factor-auth/two-factor-auth.service';
import { TwoFactorAuthController } from 'src/two-factor-auth/two-factor-auth.controller';
import { User } from 'src/typeorm';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    CacheModule.register(),
    TypeOrmModule.forFeature([User]),
    // twofa,
  ],
  controllers: [AuthController, TwoFactorAuthController],
  providers: [AuthService, TwoFactorAuthService],
})
export class AuthModule {
  constructor() {
    console.log('jwt secret ', process.env.JWT_SECRET);
  }
}
