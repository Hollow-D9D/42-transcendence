import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement, User } from 'src/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([Achievement, User])],
  providers: [AchievementsService],
})
export class AchievementsModule {}
