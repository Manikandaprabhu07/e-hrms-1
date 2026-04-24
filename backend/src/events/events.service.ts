import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  findUpcoming(): Promise<Event[]> {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    return this.eventsRepository.find({
      where: { date: MoreThanOrEqual(dateString) },
      order: { date: 'ASC' },
      take: 10,
    });
  }

  findOne(id: string): Promise<Event | null> {
    return this.eventsRepository.findOneBy({ id });
  }

  async update(id: string, changes: Partial<Event>): Promise<Event> {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('Event not found');
    }
    const updated = Object.assign(existing, changes);
    return this.eventsRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Event not found');
    }
  }

  create(event: Partial<Event>): Promise<Event> {
    const entity = this.eventsRepository.create(event);
    return this.eventsRepository.save(entity);
  }
}
