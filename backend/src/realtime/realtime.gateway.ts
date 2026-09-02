import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors:{origin:'*'}, namespace:'/live' })
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;
  private logger=new Logger(RealtimeGateway.name);
  handleConnection(client:any){ this.logger.log(`client ${client.id} connected to /live`); }
  broadcast(event:string, payload:any){
    if(this.server) this.server.emit(event, payload);
    this.logger.log(`WS ${event}`);
  }
}
