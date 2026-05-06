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
exports.PerformanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const performance_entity_1 = require("./entities/performance.entity");
const notifications_service_1 = require("../notifications/notifications.service");
let PerformanceService = class PerformanceService {
    constructor(performanceRepository, notificationsService) {
        this.performanceRepository = performanceRepository;
        this.notificationsService = notificationsService;
    }
    findAll() {
        return this.performanceRepository.find({ relations: ['employee'] });
    }
    async findOne(id) {
        const record = await this.performanceRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!record) {
            throw new common_1.NotFoundException(`Performance record with ID ${id} not found`);
        }
        return record;
    }
    create(performanceData) {
        const record = this.performanceRepository.create(performanceData);
        return this.performanceRepository.save(record);
    }
    async update(id, performanceData) {
        await this.performanceRepository.update(id, performanceData);
        const updated = await this.findOne(id);
        const employee = updated.employee;
        if (employee?.userId) {
            await this.notificationsService.createForUser({
                userId: employee.userId,
                type: 'system',
                title: 'Performance review updated',
                message: `Admin updated your performance review for ${updated.reviewPeriod}.`,
                link: '/dashboard',
                meta: { performanceId: updated.id },
            });
        }
        return updated;
    }
    async remove(id) {
        await this.performanceRepository.delete(id);
    }
};
exports.PerformanceService = PerformanceService;
exports.PerformanceService = PerformanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(performance_entity_1.Performance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], PerformanceService);
//# sourceMappingURL=performance.service.js.map