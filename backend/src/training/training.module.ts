import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { Training } from './entities/training.entity';
import { TrainingAssignment } from './entities/training-assignment.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Training, TrainingAssignment, Employee]), NotificationsModule, UsersModule],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule { }
