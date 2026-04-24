import { Employee } from '../../employees/entities/employee.entity';
export declare class Feedback {
    id: string;
    employee: Employee;
    message: string;
    createdAt: Date;
}
