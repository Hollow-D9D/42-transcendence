import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { GameMatchService } from './game-match.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class GameMatchGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly gameMatchService: GameMatchService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    // Additional logic for handling connection
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    // Additional logic for handling disconnection
  }

  @SubscribeMessage('start-game')
  async handleChatMessage(client: Socket, payload: any) {
    console.log('start-game', payload);
    if (!payload.login)
      return { error: new Error('No login provided!'), body: null };
    const reponse = await this.gameMatchService.addToQueue(payload.login);
    console.log(reponse);
    return { error: null, body: reponse };
  }
}
