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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const leave_entity_1 = require("./entities/leave.entity");
const employee_entity_1 = require("../employees/entities/employee.entity");
let LeaveService = class LeaveService {
    constructor(leaveRepository, employeesRepository) {
        this.leaveRepository = leaveRepository;
        this.employeesRepository = employeesRepository;
    }
    findAll() {
        return this.leaveRepository.find({
            relations: ['employee'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const record = await this.leaveRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!record) {
            throw new common_1.NotFoundException(`Leave record with ID ${id} not found`);
        }
        return record;
    }
    async create(leaveData) {
        if (leaveData.employeeId) {
            const employee = await this.employeesRepository.findOne({ where: { id: leaveData.employeeId } });
            if (!employee) {
                throw new common_1.NotFoundException('Employee not found');
            }
            leaveData.employee = employee;
        }
        const record = this.leaveRepository.create(leaveData);
        return this.leaveRepository.save(record);
    }
    async update(id, leaveData) {
        await this.leaveRepository.update(id, leaveData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.leaveRepository.delete(id);
    }
    findByEmployee(employeeId) {
        return this.leaveRepository.find({
            where: { employee: { id: employeeId } },
            relations: ['employee'],
            order: { createdAt: 'DESC' },
        });
    }
    findPending() {
        return this.leaveRepository.find({
            where: { status: 'Pending' },
            order: { createdAt: 'DESC' },
            relations: ['employee'],
        });
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_entity_1.Leave)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LeaveService);
//# sourceMappingURL=leave.service.js.map