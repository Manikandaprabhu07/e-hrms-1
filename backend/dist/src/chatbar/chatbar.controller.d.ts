import { NotificationsService } from '../notifications/notifications.service';
import { MessagesService } from '../messages/messages.service';
import { Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { Conversation } from '../messages/entities/conversation.entity';
export declare class ChatbarController {
    private readonly notificationsService;
    private readonly messagesService;
    private readonly messageRepo;
    private readonly convRepo;
    constructor(notificationsService: NotificationsService, messagesService: MessagesService, messageRepo: Repository<Message>, convRepo: Repository<Conversation>);
    overview(req: any): Promise<{
        unreadNotifications: number;
        unreadMessages: number;
    }>;
}
