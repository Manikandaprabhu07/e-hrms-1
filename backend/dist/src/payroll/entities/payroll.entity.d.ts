import { Employee } from '../../employees/entities/employee.entity';
export declare class Payroll {
    id: string;
    employee: Employee;
    month: string;
    year: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    paymentStatus: string;
    paymentDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
