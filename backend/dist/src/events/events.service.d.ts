import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
export declare class EventsService {
    private eventsRepository;
    constructor(eventsRepository: Repository<Event>);
    findUpcoming(): Promise<Event[]>;
    findOne(id: string): Promise<Event | null>;
    update(id: string, changes: Partial<Event>): Promise<Event>;
    remove(id: string): Promise<void>;
    create(event: Partial<Event>): Promise<Event>;
}
