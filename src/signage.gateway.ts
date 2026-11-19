import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SignageService } from './signage.service';

@WebSocketGateway({ cors: true })
export class SignageGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private s: SignageService) {}

  /** Player yang baru tersambung (atau tersambung ulang) langsung menerima kondisi antrian terakhir. */
  handleConnection(c: Socket) {
    c.emit('queue:all', this.s.queue);
  }

  emit(event: string, data: any) {
    this.server.emit(event, data);
  }
}
