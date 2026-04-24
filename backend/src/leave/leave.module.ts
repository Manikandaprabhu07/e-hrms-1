import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { Leave } from './entities/leave.entity';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [TypeOrmModule.forFeature([Leave, Employee]), EmployeesModule],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule { }
