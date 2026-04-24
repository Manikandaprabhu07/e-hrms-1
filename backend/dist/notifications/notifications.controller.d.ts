import { NotificationsService } from './notifications.service';
import { UsersService } from '../users/users.service';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly usersService;
    constructor(notificationsService: NotificationsService, usersService: UsersService);
    my(req: any): Promise<import("./entities/notification.entity").Notification[]>;
    unreadCount(req: any): Promise<{
        count: number;
    }>;
    readAll(req: any): Promise<{
        ok: boolean;
    }>;
    readOne(req: any, id: string): Promise<{
        ok: boolean;
    }>;
    create(body: any): Promise<import("./entities/notification.entity").Notification | {
        ok: boolean;
    }>;
}
