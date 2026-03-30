import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

const wsCorsOrigins = (process.env.WS_CORS_ORIGIN || process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: wsCorsOrigins.length
      ? wsCorsOrigins
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
})

export class AssetsGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  @SubscribeMessage('subscribeToSymbol')
  handleSubscription(
    @MessageBody() data: { symbol: string },
    @ConnectedSocket() client: Socket,
  ) {
    // WebSocket payload-იც user input-ია, ამიტომ HTTP-ის მსგავსად validate აუცილებელია.
    const symbol = data?.symbol?.trim().toUpperCase();
    if (!symbol || !/^[A-Z0-9]{3,20}$/.test(symbol)) {
      throw new WsException('Invalid symbol format. Use uppercase market symbol, e.g. BTCUSDT');
    }

    client.join(symbol.toLowerCase());
    this.logger.log(`Client ${client.id} joined room: ${symbol}`);
    return { status: 'joined', room: symbol.toLowerCase() };
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