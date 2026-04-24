import { Repository } from 'typeorm';
import { Training } from './entities/training.entity';
import { TrainingAssignment } from './entities/training-assignment.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
export declare class TrainingService {
    private trainingRepository;
    private assignmentsRepository;
    private employeesRepository;
    private notificationsService;
    private usersService;
    constructor(trainingRepository: Repository<Training>, assignmentsRepository: Repository<TrainingAssignment>, employeesRepository: Repository<Employee>, notificationsService: NotificationsService, usersService: UsersService);
    findAll(): Promise<Training[]>;
    private normalizeFilterValue;
    private resolveEmployeesForAssignment;
    private assignTrainingToEmployees;
    findMyAssignments(userId: string): Promise<TrainingAssignment[]>;
    findOne(id: string): Promise<Training>;
    listAssignmentsForTraining(trainingId: string): Promise<TrainingAssignment[]>;
    create(trainingData: Partial<Training>): Promise<Training>;
    createWithAssignments(input: any): Promise<Training>;
    backfillAssignments(trainingId: string): Promise<{
        inserted: number;
        targeted: number;
    }>;
    updateMyProgress(userId: string, assignmentId: string, progress: number): Promise<TrainingAssignment>;
    update(id: string, trainingData: Partial<Training>): Promise<Training>;
    remove(id: string): Promise<void>;
}
