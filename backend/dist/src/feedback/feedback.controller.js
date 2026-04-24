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
exports.FeedbackController = void 0;
const common_1 = require("@nestjs/common");
const feedback_service_1 = require("./feedback.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const employees_service_1 = require("../employees/employees.service");
let FeedbackController = class FeedbackController {
    constructor(feedbackService, employeesService) {
        this.feedbackService = feedbackService;
        this.employeesService = employeesService;
    }
    findAll() {
        return this.feedbackService.findAll();
    }
    async create(body, req) {
        let employeeId = body.employeeId;
        if (!employeeId) {
            const employee = await this.employeesService.findByEmail(req.user.email);
            employeeId = employee?.id;
        }
        if (!employeeId) {
            throw new Error('Employee not found');
        }
        return this.feedbackService.create(employeeId, body.message);
    }
};
exports.FeedbackController = FeedbackController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FeedbackController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('EMPLOYEE', 'ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FeedbackController.prototype, "create", null);
exports.FeedbackController = FeedbackController = __decorate([
    (0, common_1.Controller)('feedback'),
    __metadata("design:paramtypes", [feedback_service_1.FeedbackService,
        employees_service_1.EmployeesService])
], FeedbackController);
//# sourceMappingURL=feedback.controller.js.map