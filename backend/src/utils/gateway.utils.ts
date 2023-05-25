import { Socket, Server } from 'socket.io';

export const throwError = (client: Socket, error: string) => {
  client.emit('error', {
    error: new Error(error),
    body: null,
  });
};
