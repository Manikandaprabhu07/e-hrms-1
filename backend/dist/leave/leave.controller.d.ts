import { LeaveService } from './leave.service';
import { Leave } from './entities/leave.entity';
import { EmployeesService } from '../employees/employees.service';
export declare class LeaveController {
    private readonly leaveService;
    private readonly employeesService;
    constructor(leaveService: LeaveService, employeesService: EmployeesService);
    findAll(): Promise<Leave[]>;
    findPending(): Promise<Leave[]>;
    findMy(req: any): Promise<Leave[]>;
    findOne(id: string): Promise<Leave>;
    create(leaveData: Partial<Leave> & {
        employeeId?: string;
    }, req: any): Promise<Leave>;
    update(id: string, leaveData: Partial<Leave>): Promise<Leave>;
    remove(id: string): Promise<void>;
}
