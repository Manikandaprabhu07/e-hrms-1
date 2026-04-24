import { FeedbackService } from './feedback.service';
import { Feedback } from './entities/feedback.entity';
import { EmployeesService } from '../employees/employees.service';
export declare class FeedbackController {
    private readonly feedbackService;
    private readonly employeesService;
    constructor(feedbackService: FeedbackService, employeesService: EmployeesService);
    findAll(): Promise<Feedback[]>;
    create(body: {
        employeeId?: string;
        message: string;
    }, req: any): Promise<Feedback>;
}
