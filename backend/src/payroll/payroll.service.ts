import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll } from './entities/payroll.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PayrollService {
    constructor(
        @InjectRepository(Payroll)
        private payrollRepository: Repository<Payroll>,
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
        private notificationsService: NotificationsService,
    ) { }

    findAll(): Promise<Payroll[]> {
        return this.payrollRepository.find({ relations: ['employee'], order: { createdAt: 'DESC' } as any });
    }

    async findForUser(userId: string): Promise<Payroll[]> {
        const employee = await this.employeesRepository.findOne({ where: { userId } });
        if (!employee) {
            throw new NotFoundException('Employee record not found for this user.');
        }
        return this.payrollRepository.find({
            where: { employee: { id: employee.id } as any },
            relations: ['employee'],
            order: { createdAt: 'DESC' } as any,
        });
    }

    async findOne(id: string): Promise<Payroll> {
        const record = await this.payrollRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!record) {
            throw new NotFoundException(`Payroll record with ID ${id} not found`);
        }
        return record;
    }

    async createForEmployee(input: any): Promise<Payroll> {
        if (!input.employeeId) {
            throw new BadRequestException('employeeId is required');
        }

        const employee = await this.employeesRepository.findOne({ where: { id: input.employeeId } });
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${input.employeeId} not found`);
        }

        const basic = Number(input.basicSalary || 0);
        const allowances = Number(input.allowances || 0);
        const deductions = Number(input.deductions || 0);
        const netSalary = Number(input.netSalary ?? (basic + allowances - deductions));

        const record = this.payrollRepository.create();
        record.employee = employee;
        record.month = String(input.month || '');
        record.year = Number(input.year || new Date().getFullYear());
        record.basicSalary = basic;
        record.allowances = allowances;
        record.deductions = deductions;
        record.netSalary = netSalary;
        record.paymentStatus = input.paymentStatus || 'Pending';
        record.paymentDate = input.paymentDate ? new Date(input.paymentDate) : null;

        const saved = await this.payrollRepository.save(record);

        if (employee.userId) {
            await this.notificationsService.createForUser({
                userId: employee.userId,
                type: 'payroll',
                title: 'Payroll updated',
                message: `Your payroll for ${record.month} ${record.year} has been added/updated.`,
                link: '/payroll',
                meta: { payrollId: saved.id },
            });
        }

        return saved;
    }

    async update(id: string, payrollData: Partial<Payroll>): Promise<Payroll> {
        await this.payrollRepository.update(id, payrollData);
        const updated = await this.findOne(id);
        const employee = updated.employee as any;
        if (employee?.userId) {
            await this.notificationsService.createForUser({
                userId: employee.userId,
                type: 'payroll',
                title: 'Payroll updated',
                message: `Your payroll for ${updated.month} ${updated.year} has been updated.`,
                link: '/payroll',
                meta: { payrollId: updated.id },
            });
        }
        return updated;
    }

    async remove(id: string): Promise<void> {
        await this.payrollRepository.delete(id);
    }
}
