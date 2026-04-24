import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Employee } from '../employees/entities/employee.entity';
import { Leave } from '../leave/entities/leave.entity';
import { EmployeesModule } from '../employees/employees.module';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [TypeOrmModule.forFeature([Employee, Leave]), EmployeesModule, EventsModule],
    providers: [DashboardService],
    controllers: [DashboardController],
})
export class DashboardModule { }
