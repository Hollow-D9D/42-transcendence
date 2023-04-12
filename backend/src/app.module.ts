import { Module, CacheModule, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from './profile/profile.module';
// import { AchievmentsModule } from './achievments/achievments.module';
import entities from './typeorm';
import { AchievementsModule } from './achievements/achievements.module';

@Module({
  imports: [
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
    // AchievmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('AppModule initialized');
    console.log(process.env);
  }
}
