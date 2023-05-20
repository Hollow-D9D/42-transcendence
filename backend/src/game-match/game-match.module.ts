import { Module, CacheModule } from '@nestjs/common';
import { GameMatchService } from './game-match.service';
import { GameMatchGateway } from './game-match.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameMatch, User, Achievement } from 'src/typeorm';
import { ProfileService } from 'src/profile/profile.service';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([GameMatch, User, Achievement]),
  ],
  providers: [GameMatchGateway, GameMatchService, ProfileService],
})
export class GameMatchModule {}