import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbarController } from './chatbar.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { MessagesModule } from '../messages/messages.module';
import { Message } from '../messages/entities/message.entity';
import { Conversation } from '../messages/entities/conversation.entity';

@Module({
  imports: [
    NotificationsModule,
    MessagesModule,
    TypeOrmModule.forFeature([Message, Conversation]),
  ],
  controllers: [ChatbarController],
})
export class ChatbarModule { }

