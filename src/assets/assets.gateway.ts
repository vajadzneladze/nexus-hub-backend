import { WebSocketGateway, OnGatewayInit, MessageBody, ConnectedSocket, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })

export class AssetsGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  @SubscribeMessage('subscribeToSymbol')
  handleSubscription(
    @MessageBody() data: { symbol: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.symbol.toLowerCase());
    console.log(`👤 Client ${client.id} joined room: ${data.symbol}`);
    return { status: 'joined', room: data.symbol.toLowerCase() };
  }



  private logger = new Logger(AssetsGateway.name);

  afterInit(server: Server) {
    this.logger.log('Initialized WebSocket Server');
  }

  // ახლა ეს მეთოდი აგზავნის მხოლოდ კონკრეტულ ოთახში
  broadcastPrice(symbol: string, data: any) {
    if (!this.server) {
      this.logger.error('❌ Socket server not initialized!');
      return;
    }
    this.server.to(symbol.toLowerCase()).emit('priceUpdate', data);
  }
}