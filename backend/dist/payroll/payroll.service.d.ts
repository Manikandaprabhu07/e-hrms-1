import { Repository } from 'typeorm';
import { Payroll } from './entities/payroll.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class PayrollService {
    private payrollRepository;
    private employeesRepository;
    private notificationsService;
    constructor(payrollRepository: Repository<Payroll>, employeesRepository: Repository<Employee>, notificationsService: NotificationsService);
    findAll(): Promise<Payroll[]>;
    findForUser(userId: string): Promise<Payroll[]>;
    findOne(id: string): Promise<Payroll>;
    createForEmployee(input: any): Promise<Payroll>;
    update(id: string, payrollData: Partial<Payroll>): Promise<Payroll>;
    remove(id: string): Promise<void>;
}
