import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmployeesService } from '../employees/employees.service';
export declare class MessagesService {
    private conversationsRepository;
    private messagesRepository;
    private usersService;
    private employeesService;
    private notificationsService;
    private cachedAdminUserId;
    constructor(conversationsRepository: Repository<Conversation>, messagesRepository: Repository<Message>, usersService: UsersService, employeesService: EmployeesService, notificationsService: NotificationsService);
    private getAdminUserId;
    private assertMember;
    ensureEmployeeConversation(employeeUserId: string): Promise<Conversation>;
    ensureConversationForEmployeeId(employeeId: string): Promise<Conversation>;
    listMyConversations(userId: string): Promise<any[]>;
    getConversationMessages(conversationId: string, userId: string): Promise<Message[]>;
    markConversationRead(conversationId: string, userId: string): Promise<void>;
    sendMessage(conversationId: string, userId: string, content: string): Promise<Message>;
}
