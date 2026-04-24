import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { UsersModule } from '../users/users.module';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), UsersModule, AccessModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule { }
