import { Module, CacheModule } from '@nestjs/common';
import { GameMatchService } from './game-match.service';
import { GameMatchGateway } from './game-match.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameMatch, User, Achievement } from 'src/typeorm';
import { ProfileService } from 'src/profile/profile.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    CacheModule.register(),
    TypeOrmModule.forFeature([GameMatch, User, Achievement]),
  ],
  providers: [GameMatchGateway, GameMatchService, ProfileService],
})
export class GameMatchModule {}
