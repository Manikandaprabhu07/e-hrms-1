import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AttendanceService {
    private attendanceRepository;
    private employeesRepository;
    private notificationsService;
    constructor(attendanceRepository: Repository<Attendance>, employeesRepository: Repository<Employee>, notificationsService: NotificationsService);
    findAll(): Promise<Attendance[]>;
    findForEmployee(employeeId: string): Promise<Attendance[]>;
    findForUser(userId: string): Promise<Attendance[]>;
    findOne(id: string): Promise<Attendance>;
    createForEmployee(attendanceData: {
        employeeId: string;
        date: string;
        status?: string;
        clockIn?: string | Date | null;
        clockOut?: string | Date | null;
    }): Promise<Attendance>;
    update(id: string, attendanceData: Partial<Attendance>): Promise<Attendance>;
    remove(id: string): Promise<void>;
}
