import { Employee } from '../../employees/entities/employee.entity';
export declare class Attendance {
    id: string;
    employee: Employee;
    date: string;
    clockIn: Date | null;
    clockOut: Date | null;
    status: string;
    createdAt: Date;
}
