import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    findAll(): Promise<Attendance[]>;
    findForEmployee(employeeId: string): Promise<Attendance[]>;
    findMy(req: any): Promise<Attendance[]>;
    findOne(id: string): Promise<Attendance>;
    create(attendanceData: {
        employeeId: string;
        date: string;
        status?: string;
        clockIn?: string | null;
        clockOut?: string | null;
    }): Promise<Attendance>;
    update(id: string, attendanceData: Partial<Attendance>): Promise<Attendance>;
    remove(id: string): Promise<void>;
}
