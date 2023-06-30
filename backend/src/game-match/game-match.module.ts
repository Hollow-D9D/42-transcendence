import { Module, CacheModule } from '@nestjs/common';
import { GameMatchService } from './game-match.service';
import { GameMatchGateway } from './game-match.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameMatch, User, Achievement, Match } from 'src/typeorm';
import { ProfileService } from 'src/profile/profile.service';
import { JwtModule } from '@nestjs/jwt';
import { AchievementsService } from 'src/achievements/achievements.service';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    CacheModule.register(),
    TypeOrmModule.forFeature([GameMatch, User, Achievement, Match]),
  ],
  providers: [
    GameMatchGateway,
    GameMatchService,
    ProfileService,
    AchievementsService,
  ],
})
export class GameMatchModule {}
