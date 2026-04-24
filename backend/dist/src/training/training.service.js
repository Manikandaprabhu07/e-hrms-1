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
exports.TrainingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const training_entity_1 = require("./entities/training.entity");
const training_assignment_entity_1 = require("./entities/training-assignment.entity");
const employee_entity_1 = require("../employees/entities/employee.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const users_service_1 = require("../users/users.service");
let TrainingService = class TrainingService {
    constructor(trainingRepository, assignmentsRepository, employeesRepository, notificationsService, usersService) {
        this.trainingRepository = trainingRepository;
        this.assignmentsRepository = assignmentsRepository;
        this.employeesRepository = employeesRepository;
        this.notificationsService = notificationsService;
        this.usersService = usersService;
    }
    findAll() {
        return this.trainingRepository.find({ relations: ['participants'] });
    }
    normalizeFilterValue(v) {
        if (v === undefined || v === null)
            return null;
        const s = String(v).trim().toLowerCase();
        return s ? s : null;
    }
    async resolveEmployeesForAssignment(input, training) {
        if (Array.isArray(input?.participantEmployeeIds) && input.participantEmployeeIds.length) {
            return this.employeesRepository.find({
                where: input.participantEmployeeIds.map((id) => ({ id })),
            });
        }
        const dept = this.normalizeFilterValue(input?.targetDepartment ?? training.targetDepartment);
        const role = this.normalizeFilterValue(input?.targetRole ?? training.targetRole);
        const all = await this.employeesRepository.find();
        return all.filter((e) => {
            const empDept = this.normalizeFilterValue(e.department) || '';
            const empRole = this.normalizeFilterValue(e.designation) || '';
            const okDept = dept ? empDept === dept : true;
            const okRole = role ? empRole === role : true;
            return okDept && okRole;
        });
    }
    async assignTrainingToEmployees(training, employees, notify) {
        let inserted = 0;
        for (const employee of employees) {
            const a = this.assignmentsRepository.create();
            a.training = training;
            a.employee = employee;
            a.status = 'Assigned';
            a.progress = 0;
            a.completedAt = null;
            try {
                await this.assignmentsRepository.save(a);
                inserted += 1;
            }
            catch (e) {
                if (String(e?.code) === '23505')
                    continue;
                throw e;
            }
        }
        if (notify && employees.length) {
            const userIds = employees.map((e) => e.userId).filter(Boolean);
            await this.notificationsService.createForUsers({
                userIds,
                type: 'training',
                title: 'New training assigned',
                message: `You have been assigned a new training: ${training.title}`,
                link: '/training',
                meta: { trainingId: training.id },
            });
        }
        return { inserted };
    }
    async findMyAssignments(userId) {
        const employee = await this.employeesRepository.findOne({ where: { userId } });
        if (!employee) {
            throw new common_1.NotFoundException('Employee record not found for this user.');
        }
        return this.assignmentsRepository.find({
            where: { employee: { id: employee.id } },
            relations: ['training', 'employee'],
            order: { updatedAt: 'DESC' },
        });
    }
    async findOne(id) {
        const training = await this.trainingRepository.findOne({
            where: { id },
            relations: ['participants'],
        });
        if (!training) {
            throw new common_1.NotFoundException(`Training with ID ${id} not found`);
        }
        return training;
    }
    async listAssignmentsForTraining(trainingId) {
        const training = await this.trainingRepository.findOne({ where: { id: trainingId } });
        if (!training)
            throw new common_1.NotFoundException('Training not found');
        return this.assignmentsRepository.find({
            where: { training: { id: trainingId } },
            relations: ['employee', 'training'],
            order: { updatedAt: 'DESC' },
        });
    }
    create(trainingData) {
        const training = this.trainingRepository.create(trainingData);
        return this.trainingRepository.save(training);
    }
    async createWithAssignments(input) {
        const training = this.trainingRepository.create({
            title: input.title,
            description: input.description,
            trainer: input.trainer,
            startDate: input.startDate,
            endDate: input.endDate,
            status: input.status || 'Upcoming',
            isActive: input.isActive ?? true,
            targetDepartment: input.targetDepartment || null,
            targetRole: input.targetRole || null,
        });
        const saved = await this.trainingRepository.save(training);
        const employees = await this.resolveEmployeesForAssignment(input, saved);
        await this.assignTrainingToEmployees(saved, employees, true);
        return saved;
    }
    async backfillAssignments(trainingId) {
        const training = await this.trainingRepository.findOne({ where: { id: trainingId } });
        if (!training)
            throw new common_1.NotFoundException('Training not found');
        const employees = await this.resolveEmployeesForAssignment({}, training);
        const { inserted } = await this.assignTrainingToEmployees(training, employees, false);
        return { inserted, targeted: employees.length };
    }
    async updateMyProgress(userId, assignmentId, progress) {
        const employee = await this.employeesRepository.findOne({ where: { userId } });
        if (!employee)
            throw new common_1.NotFoundException('Employee record not found for this user.');
        const assignment = await this.assignmentsRepository.findOne({
            where: { id: assignmentId },
            relations: ['employee', 'training'],
        });
        if (!assignment)
            throw new common_1.NotFoundException('Training assignment not found');
        if (assignment.employee.id !== employee.id)
            throw new common_1.BadRequestException('Not your assignment');
        const p = Math.max(0, Math.min(100, Number(progress)));
        assignment.progress = p;
        assignment.status = p >= 100 ? 'Completed' : (p > 0 ? 'InProgress' : 'Assigned');
        assignment.completedAt = p >= 100 ? new Date() : null;
        const saved = await this.assignmentsRepository.save(assignment);
        if (p >= 100) {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@hrms.com';
            const admin = await this.usersService.findOneByEmail(adminEmail);
            if (admin) {
                await this.notificationsService.createForUser({
                    userId: admin.id,
                    type: 'training',
                    title: 'Training completed',
                    message: `${employee.firstName} ${employee.lastName} completed: ${assignment.training.title}`,
                    link: '/training',
                    meta: { assignmentId: saved.id, trainingId: assignment.training.id, employeeId: employee.id },
                });
            }
        }
        return saved;
    }
    async update(id, trainingData) {
        await this.trainingRepository.update(id, trainingData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.trainingRepository.delete(id);
    }
};
exports.TrainingService = TrainingService;
exports.TrainingService = TrainingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(training_entity_1.Training)),
    __param(1, (0, typeorm_1.InjectRepository)(training_assignment_entity_1.TrainingAssignment)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        users_service_1.UsersService])
], TrainingService);
//# sourceMappingURL=training.service.js.map