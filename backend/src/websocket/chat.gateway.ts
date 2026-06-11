import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private messagesService: MessagesService) {}

  @SubscribeMessage('joinChat')
  handleJoinChat(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
    client.join(chatId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { chatId: string; content: string; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.send(data.senderId, {
      chatId: data.chatId,
      content: data.content,
    });
    this.server.to(data.chatId).emit('newMessage', message);
    return message;
  }
}
