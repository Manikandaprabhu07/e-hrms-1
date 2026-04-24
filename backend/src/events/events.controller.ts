import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { EventsService } from './events.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Roles('EMPLOYEE', 'ADMIN')
  getUpcomingEvents() {
    return this.eventsService.findUpcoming();
  }

  @Post()
  @Roles('ADMIN')
  createEvent(@Body() eventData: { title: string; description?: string; date: string }) {
    return this.eventsService.create(eventData);
  }

  @Put(':id')
  @Roles('ADMIN')
  updateEvent(
    @Param('id') id: string,
    @Body() eventData: { title?: string; description?: string; date?: string },
  ) {
    return this.eventsService.update(id, eventData);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
