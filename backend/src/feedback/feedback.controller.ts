import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Feedback } from './entities/feedback.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { EmployeesService } from '../employees/employees.service';

@Controller('feedback')
export class FeedbackController {
    constructor(
        private readonly feedbackService: FeedbackService,
        private readonly employeesService: EmployeesService,
    ) { }

    @Get()
    @Roles('ADMIN')
    findAll(): Promise<Feedback[]> {
        return this.feedbackService.findAll();
    }

    @Post()
    @Roles('EMPLOYEE', 'ADMIN')
    async create(@Body() body: { employeeId?: string; message: string }, @Request() req: any): Promise<Feedback> {
        let employeeId = body.employeeId;
        if (!employeeId) {
            const employee = await this.employeesService.findByEmail(req.user.email);
            employeeId = employee?.id;
        }
        if (!employeeId) {
            throw new Error('Employee not found');
        }
        return this.feedbackService.create(employeeId, body.message);
    }
}
