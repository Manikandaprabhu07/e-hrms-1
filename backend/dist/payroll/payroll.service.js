"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payroll_entity_1 = require("./entities/payroll.entity");
const employee_entity_1 = require("../employees/entities/employee.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const XLSX = __importStar(require("xlsx"));
let PayrollService = class PayrollService {
    constructor(payrollRepository, employeesRepository, notificationsService) {
        this.payrollRepository = payrollRepository;
        this.employeesRepository = employeesRepository;
        this.notificationsService = notificationsService;
    }
    findAll() {
        return this.payrollRepository.find({ relations: ['employee'], order: { createdAt: 'DESC' } });
    }
    async findForUser(userId) {
        const employee = await this.employeesRepository.findOne({ where: { userId } });
        if (!employee) {
            throw new common_1.NotFoundException('Employee record not found for this user.');
        }
        return this.payrollRepository.find({
            where: { employee: { id: employee.id } },
            relations: ['employee'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const record = await this.payrollRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!record) {
            throw new common_1.NotFoundException(`Payroll record with ID ${id} not found`);
        }
        return record;
    }
    async createForEmployee(input) {
        if (!input.employeeId) {
            throw new common_1.BadRequestException('employeeId is required');
        }
        const employee = await this.employeesRepository.findOne({ where: { id: input.employeeId } });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${input.employeeId} not found`);
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
    uploadPreview(file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('Please upload an Excel or CSV file.');
        }
        const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        if (!sheet) {
            throw new common_1.BadRequestException('The uploaded file does not contain a readable sheet.');
        }
        const rows = XLSX.utils.sheet_to_json(sheet, {
            defval: '',
            raw: false,
        });
        return rows
            .map((row, index) => this.mapImportRow(row, index))
            .filter((row) => row !== null);
    }
    async saveImportedPayroll(rows) {
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new common_1.BadRequestException('No payroll rows were provided for import.');
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
    async update(id, payrollData) {
        await this.payrollRepository.update(id, payrollData);
        const updated = await this.findOne(id);
        const employee = updated.employee;
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
    async remove(id) {
        await this.payrollRepository.delete(id);
    }
    mapImportRow(row, index) {
        const employeeId = this.stringValue(this.pickValue(row, ['Employee ID', 'Employee Id', 'employeeId', 'employee_id']));
        const month = this.stringValue(this.pickValue(row, ['Month', 'Payroll Month', 'month']));
        if (!employeeId || !month) {
            return null;
        }
        return this.normalizeImportedPayroll({
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
        }, index);
    }
    normalizeImportedPayroll(input, index) {
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
    async findImportEmployee(employeeId) {
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
    pickValue(row, keys) {
        for (const key of keys) {
            if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                return row[key];
            }
        }
        return '';
    }
    stringValue(value) {
        return String(value ?? '').trim();
    }
    numberValue(value) {
        if (value === null || value === undefined || value === '') {
            return 0;
        }
        const parsed = Number(String(value).replace(/[^0-9.-]/g, '').trim());
        return Number.isFinite(parsed) ? parsed : 0;
    }
    normalizeDate(value) {
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
    normalizePaymentStatus(value) {
        const normalized = this.stringValue(value).toLowerCase();
        const map = {
            paid: 'Paid',
            pending: 'Pending',
            processing: 'Processing',
            cancelled: 'Cancelled',
        };
        return map[normalized] || 'Pending';
    }
    isUuid(value) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payroll_entity_1.Payroll)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map