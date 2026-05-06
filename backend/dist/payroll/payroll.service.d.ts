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
    uploadPreview(file?: {
        buffer?: Buffer;
    }): any[];
    saveImportedPayroll(rows: any[]): Promise<{
        message: string;
        saved: number;
        skipped: number;
    }>;
    update(id: string, payrollData: Partial<Payroll>): Promise<Payroll>;
    remove(id: string): Promise<void>;
    private mapImportRow;
    private normalizeImportedPayroll;
    private findImportEmployee;
    private pickValue;
    private stringValue;
    private numberValue;
    private normalizeDate;
    private normalizePaymentStatus;
    private isUuid;
}
