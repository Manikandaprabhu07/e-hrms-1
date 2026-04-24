import { Training } from './training.entity';
import { Employee } from '../../employees/entities/employee.entity';
export type TrainingAssignmentStatus = 'Assigned' | 'InProgress' | 'Completed';
export declare class TrainingAssignment {
    id: string;
    training: Training;
    employee: Employee;
    status: TrainingAssignmentStatus;
    progress: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
