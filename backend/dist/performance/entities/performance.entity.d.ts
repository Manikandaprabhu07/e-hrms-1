import { Employee } from '../../employees/entities/employee.entity';
export declare class Performance {
    id: string;
    employee: Employee;
    reviewPeriod: string;
    rating: number;
    feedback: string;
    goals: string;
    achievements: string;
    reviewer: string;
    createdAt: Date;
    updatedAt: Date;
}
