import { Repository } from 'typeorm';
import { Leave } from './entities/leave.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class LeaveService {
    private leaveRepository;
    private employeesRepository;
    private notificationsService;
    constructor(leaveRepository: Repository<Leave>, employeesRepository: Repository<Employee>, notificationsService: NotificationsService);
    findAll(): Promise<Leave[]>;
    findOne(id: string): Promise<Leave>;
    create(leaveData: Partial<Leave> & {
        employeeId?: string;
    }): Promise<Leave>;
    update(id: string, leaveData: Partial<Leave>): Promise<Leave>;
    remove(id: string): Promise<void>;
    findByEmployee(employeeId: string): Promise<Leave[]>;
    findPending(): Promise<Leave[]>;
}
