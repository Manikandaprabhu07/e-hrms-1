import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { Employee } from '../employees/entities/employee.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { EmployeesModule } from '../employees/employees.module';

@Module({
    imports: [TypeOrmModule.forFeature([Feedback, Employee]), EmployeesModule],
    providers: [FeedbackService],
    controllers: [FeedbackController],
})
export class FeedbackModule { }
