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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("./entities/attendance.entity");
const employee_entity_1 = require("../employees/entities/employee.entity");
const notifications_service_1 = require("../notifications/notifications.service");
let AttendanceService = class AttendanceService {
    constructor(attendanceRepository, employeesRepository, notificationsService) {
        this.attendanceRepository = attendanceRepository;
        this.employeesRepository = employeesRepository;
        this.notificationsService = notificationsService;
    }
    findAll() {
        return this.attendanceRepository.find({
            relations: ['employee'],
            order: { date: 'DESC', createdAt: 'DESC' },
        });
    }
    async findForEmployee(employeeId) {
        return this.attendanceRepository.find({
            where: { employee: { id: employeeId } },
            relations: ['employee'],
            order: { date: 'DESC', createdAt: 'DESC' },
        });
    }
    async findForUser(userId) {
        const employee = await this.employeesRepository.findOne({ where: { userId } });
        if (!employee) {
            throw new common_1.NotFoundException('Employee record not found for this user.');
        }
        return this.findForEmployee(employee.id);
    }
    async findOne(id) {
        const record = await this.attendanceRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!record) {
            throw new common_1.NotFoundException(`Attendance record with ID ${id} not found`);
        }
        return record;
    }
    async createForEmployee(attendanceData) {
        if (!attendanceData.employeeId) {
            throw new common_1.BadRequestException('employeeId is required');
        }
        if (!attendanceData.date) {
            throw new common_1.BadRequestException('date is required');
        }
        const employee = await this.employeesRepository.findOne({ where: { id: attendanceData.employeeId } });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${attendanceData.employeeId} not found`);
        }
        const existing = await this.attendanceRepository.findOne({
            where: { employee: { id: employee.id }, date: attendanceData.date },
            relations: ['employee'],
        });
        const record = existing ?? this.attendanceRepository.create();
        record.employee = employee;
        record.date = attendanceData.date;
        record.status = (attendanceData.status ?? 'present').toString().toLowerCase();
        record.clockIn = attendanceData.clockIn ? new Date(attendanceData.clockIn) : null;
        record.clockOut = attendanceData.clockOut ? new Date(attendanceData.clockOut) : null;
        const saved = await this.attendanceRepository.save(record);
        if (employee.userId) {
            await this.notificationsService.createForUser({
                userId: employee.userId,
                type: 'attendance',
                title: 'Attendance updated',
                message: `Attendance marked for ${record.date}: ${record.status}`,
                link: '/attendance',
                meta: { attendanceId: saved.id, date: record.date },
            });
        }
        return saved;
    }
    async update(id, attendanceData) {
        await this.attendanceRepository.update(id, attendanceData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.attendanceRepository.delete(id);
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map