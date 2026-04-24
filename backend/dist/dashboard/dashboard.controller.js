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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const employees_service_1 = require("../employees/employees.service");
let DashboardController = class DashboardController {
    constructor(dashboardService, employeesService) {
        this.dashboardService = dashboardService;
        this.employeesService = employeesService;
    }
    getAdminDashboard() {
        return this.dashboardService.getAdminDashboard();
    }
    async getEmployeeDashboard(req) {
        const user = req.user;
        const employee = await this.employeesService.findByEmail(user.email);
        if (!employee) {
            return { leaveSummary: { pending: 0, approved: 0, rejected: 0 } };
        }
        return this.dashboardService.getEmployeeDashboard(employee.id);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('admin'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getAdminDashboard", null);
__decorate([
    (0, common_1.Get)('employee'),
    (0, roles_decorator_1.Roles)('EMPLOYEE', 'ADMIN'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getEmployeeDashboard", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService,
        employees_service_1.EmployeesService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map