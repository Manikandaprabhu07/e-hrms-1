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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("./leave.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const employees_service_1 = require("../employees/employees.service");
let LeaveController = class LeaveController {
    constructor(leaveService, employeesService) {
        this.leaveService = leaveService;
        this.employeesService = employeesService;
    }
    findAll() {
        return this.leaveService.findAll();
    }
    findPending() {
        return this.leaveService.findPending();
    }
    async findMy(req) {
        const user = req.user;
        const employee = await this.employeesService.findByEmail(user.email);
        if (!employee) {
            return [];
        }
        return this.leaveService.findByEmployee(employee.id);
    }
    findOne(id) {
        return this.leaveService.findOne(id);
    }
    async create(leaveData, req) {
        if (!leaveData.employeeId) {
            const employee = await this.employeesService.findByEmail(req.user.email);
            if (employee) {
                leaveData.employeeId = employee.id;
            }
        }
        return this.leaveService.create(leaveData);
    }
    update(id, leaveData) {
        return this.leaveService.update(id, leaveData);
    }
    remove(id) {
        return this.leaveService.remove(id);
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "findPending", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, roles_decorator_1.Roles)('EMPLOYEE', 'ADMIN'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('EMPLOYEE', 'ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "remove", null);
exports.LeaveController = LeaveController = __decorate([
    (0, common_1.Controller)('leave'),
    __metadata("design:paramtypes", [leave_service_1.LeaveService,
        employees_service_1.EmployeesService])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map