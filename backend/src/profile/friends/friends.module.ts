import { Module, CacheModule } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement, User } from 'src/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AchievementsService } from 'src/achievements/achievements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Achievement]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    CacheModule.register(),
  ],
  controllers: [FriendsController],
  providers: [FriendsService, AchievementsService],
})
export class FriendsModule {}
