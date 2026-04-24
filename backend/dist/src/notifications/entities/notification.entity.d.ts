export type NotificationType = 'system' | 'payroll' | 'training' | 'leave' | 'attendance' | 'message';
export declare class Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link: string;
    isRead: boolean;
    meta: any;
    createdAt: Date;
}
