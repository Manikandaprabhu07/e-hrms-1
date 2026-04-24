import { Body, Controller, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Get('my/conversations')
  @Roles('ADMIN', 'EMPLOYEE')
  myConversations(@Request() req: any) {
    return this.messagesService.listMyConversations(req.user.id);
  }

  @Post('start/employee/:employeeId')
  @Roles('ADMIN')
  startForEmployee(@Param('employeeId') employeeId: string) {
    return this.messagesService.ensureConversationForEmployeeId(employeeId);
  }

  @Post('start')
  @Roles('EMPLOYEE')
  startMine(@Request() req: any) {
    return this.messagesService.ensureEmployeeConversation(req.user.id);
  }

  @Get('conversations/:id')
  @Roles('ADMIN', 'EMPLOYEE')
  getMessages(@Request() req: any, @Param('id') id: string) {
    return this.messagesService.getConversationMessages(id, req.user.id);
  }

  @Patch('conversations/:id/read')
  @Roles('ADMIN', 'EMPLOYEE')
  async markRead(@Request() req: any, @Param('id') id: string) {
    await this.messagesService.markConversationRead(id, req.user.id);
    return { ok: true };
  }

  @Post('conversations/:id')
  @Roles('ADMIN', 'EMPLOYEE')
  send(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.messagesService.sendMessage(id, req.user.id, body.content);
  }
}

