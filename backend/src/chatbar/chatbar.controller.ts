import { Controller, Get, Request } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagesService } from '../messages/messages.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { Conversation } from '../messages/entities/conversation.entity';

@Controller('chatbar')
export class ChatbarController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly messagesService: MessagesService,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
  ) { }

  @Get('overview')
  @Roles('ADMIN', 'EMPLOYEE')
  async overview(@Request() req: any) {
    const userId = req.user.id;
    const unreadNotifications = await this.notificationsService.unreadCount(userId);

    // compute unread messages across my conversations
    const convs = await this.convRepo.find({
      where: [{ adminUserId: userId }, { employeeUserId: userId }],
    });
    let unreadMessages = 0;
    for (const conv of convs) {
      unreadMessages += await this.messageRepo.count({
        where: userId === conv.adminUserId
          ? { conversation: { id: conv.id } as any, unreadForAdmin: true }
          : { conversation: { id: conv.id } as any, unreadForEmployee: true },
      } as any);
    }

    return {
      unreadNotifications,
      unreadMessages,
    };
  }
}

