import { EventsService } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    getUpcomingEvents(): Promise<import("./entities/event.entity").Event[]>;
    createEvent(eventData: {
        title: string;
        description?: string;
        date: string;
    }): Promise<import("./entities/event.entity").Event>;
    updateEvent(id: string, eventData: {
        title?: string;
        description?: string;
        date?: string;
    }): Promise<import("./entities/event.entity").Event>;
    deleteEvent(id: string): Promise<void>;
}
