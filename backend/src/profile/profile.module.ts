import { Module, CacheModule } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Achievement } from 'src/typeorm';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Achievement]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    CacheModule.register(),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
