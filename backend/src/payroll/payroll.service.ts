import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll } from './entities/payroll.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import * as XLSX from 'xlsx';

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

    uploadPreview(file?: { buffer?: Buffer }) {
        if (!file?.buffer?.length) {
            throw new BadRequestException('Please upload an Excel or CSV file.');
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];

        if (!sheet) {
            throw new BadRequestException('The uploaded file does not contain a readable sheet.');
        }

        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            defval: '',
            raw: false,
        });

        return rows
            .map((row: Record<string, unknown>, index: number) => this.mapImportRow(row, index))
            .filter((row: any | null): row is any => row !== null);
    }

    async saveImportedPayroll(rows: any[]) {
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new BadRequestException('No payroll rows were provided for import.');
        }

        let saved = 0;
        let skipped = 0;

        for (let index = 0; index < rows.length; index += 1) {
            const normalized = this.normalizeImportedPayroll(rows[index], index);
            if (!normalized) {
                skipped += 1;
                continue;
            }

            const employee = await this.findImportEmployee(normalized.employeeId);
            if (!employee) {
                skipped += 1;
                continue;
            }

            await this.createForEmployee({
                ...normalized,
                employeeId: employee.id,
            });
            saved += 1;
        }

        return {
            message: 'Payroll imported successfully.',
            saved,
            skipped,
        };
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

    private mapImportRow(row: Record<string, unknown>, index: number) {
        const employeeId = this.stringValue(this.pickValue(row, ['Employee ID', 'Employee Id', 'employeeId', 'employee_id']));
        const month = this.stringValue(this.pickValue(row, ['Month', 'Payroll Month', 'month']));

        if (!employeeId || !month) {
            return null;
        }

        return this.normalizeImportedPayroll(
            {
                employeeId,
                employeeName: this.stringValue(this.pickValue(row, ['Employee Name', 'Name', 'employeeName'])),
                month,
                year: this.pickValue(row, ['Year', 'Payroll Year', 'year']),
                basicSalary: this.pickValue(row, ['Basic Salary', 'Basic', 'basicSalary']),
                allowances: this.pickValue(row, ['Allowances', 'Allowance', 'allowances']),
                deductions: this.pickValue(row, ['Deductions', 'Deduction', 'deductions']),
                netSalary: this.pickValue(row, ['Net Salary', 'Net Pay', 'netSalary']),
                paymentStatus: this.pickValue(row, ['Payment Status', 'Status', 'paymentStatus']),
                paymentDate: this.pickValue(row, ['Payment Date', 'Paid Date', 'paymentDate']),
                rowNumber: index + 2,
            },
            index,
        );
    }

    private normalizeImportedPayroll(input: any, index: number) {
        const employeeId = this.stringValue(input?.employeeId);
        const month = this.stringValue(input?.month);

        if (!employeeId || !month) {
            return null;
        }

        const basicSalary = this.numberValue(input?.basicSalary);
        const allowances = this.numberValue(input?.allowances);
        const deductions = this.numberValue(input?.deductions);

        return {
            employeeId,
            employeeName: this.stringValue(input?.employeeName),
            month,
            year: this.numberValue(input?.year) || new Date().getFullYear(),
            basicSalary,
            allowances,
            deductions,
            netSalary: this.numberValue(input?.netSalary) || basicSalary + allowances - deductions,
            paymentStatus: this.normalizePaymentStatus(input?.paymentStatus),
            paymentDate: this.normalizeDate(input?.paymentDate),
            rowNumber: input?.rowNumber || index + 1,
        };
    }

    private async findImportEmployee(employeeId: string): Promise<Employee | null> {
        if (this.isUuid(employeeId)) {
            const employeeById = await this.employeesRepository.findOne({ where: { id: employeeId } });
            if (employeeById) {
                return employeeById;
            }
        }

        return this.employeesRepository.findOne({
            where: { employeeId },
        });
    }

    private pickValue(row: Record<string, unknown>, keys: string[]): unknown {
        for (const key of keys) {
            if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                return row[key];
            }
        }
        return '';
    }

    private stringValue(value: unknown): string {
        return String(value ?? '').trim();
    }

    private numberValue(value: unknown): number {
        if (value === null || value === undefined || value === '') {
            return 0;
        }

        const parsed = Number(String(value).replace(/[^0-9.-]/g, '').trim());
        return Number.isFinite(parsed) ? parsed : 0;
    }

    private normalizeDate(value: unknown): Date | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return value;
        }

        if (typeof value === 'number') {
            const parsedDate = XLSX.SSF.parse_date_code(value);
            if (parsedDate) {
                return new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d);
            }
        }

        const parsed = new Date(String(value));
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    private normalizePaymentStatus(value: unknown): string {
        const normalized = this.stringValue(value).toLowerCase();
        const map: Record<string, string> = {
            paid: 'Paid',
            pending: 'Pending',
            processing: 'Processing',
            cancelled: 'Cancelled',
        };
        return map[normalized] || 'Pending';
    }

    private isUuid(value: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }
}
