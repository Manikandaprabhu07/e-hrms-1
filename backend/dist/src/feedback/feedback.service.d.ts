import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { Employee } from '../employees/entities/employee.entity';
export declare class FeedbackService {
    private feedbackRepository;
    private employeesRepository;
    constructor(feedbackRepository: Repository<Feedback>, employeesRepository: Repository<Employee>);
    findAll(): Promise<Feedback[]>;
    create(employeeId: string, message: string): Promise<Feedback>;
}
