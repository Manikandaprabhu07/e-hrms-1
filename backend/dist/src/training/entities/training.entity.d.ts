import { Employee } from '../../employees/entities/employee.entity';
export declare class Training {
    id: string;
    title: string;
    description: string;
    trainer: string;
    startDate: string;
    endDate: string;
    status: string;
    isActive: boolean;
    targetDepartment: string;
    targetRole: string;
    participants: Employee[];
    createdAt: Date;
    updatedAt: Date;
}
