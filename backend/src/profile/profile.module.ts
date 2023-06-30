import { Module, CacheModule } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Achievement, Match } from 'src/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Achievement, Match]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    CacheModule.register(),
    FriendsModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
