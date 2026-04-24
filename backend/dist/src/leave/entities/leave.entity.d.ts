import { Employee } from '../../employees/entities/employee.entity';
export declare class Leave {
    id: string;
    employee: Employee;
    leaveType: string;
    startDate: string;
    endDate: string;
    status: string;
    reason: string;
    createdAt: Date;
    updatedAt: Date;
}
