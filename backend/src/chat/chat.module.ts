// import { Module, CacheModule } from '@nestjs/common';
// import { ChatService } from './chat.service';
// import { ChatController } from './chat.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Chat, User } from 'src/typeorm';
// import { JwtModule } from '@nestjs/jwt';
// import { ChatGateway } from './chat.gateway';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Chat, User]),
//     CacheModule.register(),
//     JwtModule.register({ secret: process.env.JWT_SECRET }),
//   ],
//   controllers: [ChatController],
//   providers: [ChatService, ChatGateway],
// })
// export class ChatModule {}


import { Module, CacheModule } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat, User, Message } from 'src/typeorm'; // Import Message entity
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, User, Message]), // Include Message in the forFeature() array
    CacheModule.register(),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
