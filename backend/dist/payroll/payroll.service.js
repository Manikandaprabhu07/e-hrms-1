"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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