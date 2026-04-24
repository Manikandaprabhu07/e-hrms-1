import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    myConversations(req: any): Promise<any[]>;
    startForEmployee(employeeId: string): Promise<import("./entities/conversation.entity").Conversation>;
    startMine(req: any): Promise<import("./entities/conversation.entity").Conversation>;
    getMessages(req: any, id: string): Promise<import("./entities/message.entity").Message[]>;
    markRead(req: any, id: string): Promise<{
        ok: boolean;
    }>;
    send(req: any, id: string, body: any): Promise<import("./entities/message.entity").Message>;
}
