import { Module, CacheModule, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from './profile/profile.module';
import entities from './typeorm';
import { AchievementsModule } from './achievements/achievements.module';
import { GameMatchModule } from './game-match/game-match.module';
import { ChatModule } from './chat/chat.module';
import { ChatService } from './chat/chat.service';
import { GameGateway } from './game/game.gateway';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME,
        entities: entities,
        synchronize: true,
        seeds: ['src/typeorm/seeds/*{.ts,.js}'],
        factories: ['src/typeorm/factory/*{.ts,.js}'],
      }),
    }),
    TypeOrmModule.forFeature(entities),
    CacheModule.register(),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ProfileModule,
    AchievementsModule,
    GameMatchModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, GameGateway, ChatService],
})
export class AppModule {
  constructor(
    private readonly chatService: ChatService,
  ) {
    //TODO paste this logic to make it a background task
    setInterval(async () => {
      await this.chatService.circularUnmute();
    }, 500) ;//every minute
  }
}
