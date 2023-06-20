import { Module, CacheModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorAuthService } from 'src/two-factor-auth/two-factor-auth.service';
import { TwoFactorAuthController } from 'src/two-factor-auth/two-factor-auth.controller';
import { User, Achievement } from 'src/typeorm';
import { AchievementsService } from 'src/achievements/achievements.service';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    CacheModule.register(),
    TypeOrmModule.forFeature([User, Achievement]),
    // twofa,
  ],
  controllers: [AuthController, TwoFactorAuthController],
  providers: [AuthService, TwoFactorAuthService, AchievementsService],
})
export class AuthModule {}
