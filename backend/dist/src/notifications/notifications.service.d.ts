import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
export declare class NotificationsService {
    private notificationsRepository;
    constructor(notificationsRepository: Repository<Notification>);
    getMy(userId: string, limit?: number): Promise<Notification[]>;
    unreadCount(userId: string): Promise<number>;
    markRead(userId: string, id: string): Promise<void>;
    markAllRead(userId: string): Promise<void>;
    createForUser(input: {
        userId: string;
        type?: NotificationType;
        title: string;
        message: string;
        link?: string;
        meta?: any;
    }): Promise<Notification>;
    createForUsers(input: {
        userIds: string[];
        type?: NotificationType;
        title: string;
        message: string;
        link?: string;
        meta?: any;
    }): Promise<void>;
}
