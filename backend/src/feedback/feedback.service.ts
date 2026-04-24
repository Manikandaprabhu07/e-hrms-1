import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private feedbackRepository: Repository<Feedback>,
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
    ) { }

    findAll(): Promise<Feedback[]> {
        return this.feedbackRepository.find({
            relations: ['employee'],
            order: { createdAt: 'DESC' },
        });
    }

    async create(employeeId: string, message: string): Promise<Feedback> {
        const employee = await this.employeesRepository.findOne({ where: { id: employeeId } });
        if (!employee) {
            throw new NotFoundException('Employee not found');
        }
        const feedback = this.feedbackRepository.create({ employee, message });
        return this.feedbackRepository.save(feedback);
    }
}
