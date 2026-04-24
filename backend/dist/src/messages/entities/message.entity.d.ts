import { Conversation } from './conversation.entity';
export declare class Message {
    id: string;
    conversation: Conversation;
    senderUserId: string;
    content: string;
    unreadForAdmin: boolean;
    unreadForEmployee: boolean;
    createdAt: Date;
}
