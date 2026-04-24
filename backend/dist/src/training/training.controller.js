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
exports.TrainingController = void 0;
const common_1 = require("@nestjs/common");
const training_service_1 = require("./training.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let TrainingController = class TrainingController {
    constructor(trainingService) {
        this.trainingService = trainingService;
    }
    findAll() {
        return this.trainingService.findAll();
    }
    my(req) {
        return this.trainingService.findMyAssignments(req.user.id);
    }
    findOne(id) {
        return this.trainingService.findOne(id);
    }
    assignments(id) {
        return this.trainingService.listAssignmentsForTraining(id);
    }
    create(trainingData) {
        return this.trainingService.createWithAssignments(trainingData);
    }
    backfill(id) {
        return this.trainingService.backfillAssignments(id);
    }
    update(id, trainingData) {
        return this.trainingService.update(id, trainingData);
    }
    updateProgress(req, assignmentId, body) {
        return this.trainingService.updateMyProgress(req.user.id, assignmentId, body.progress);
    }
    remove(id) {
        return this.trainingService.remove(id);
    }
};
exports.TrainingController = TrainingController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, roles_decorator_1.Roles)('EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "my", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/assignments'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "assignments", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "backfill", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('my/:assignmentId/progress'),
    (0, roles_decorator_1.Roles)('EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('assignmentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrainingController.prototype, "remove", null);
exports.TrainingController = TrainingController = __decorate([
    (0, common_1.Controller)('training'),
    __metadata("design:paramtypes", [training_service_1.TrainingService])
], TrainingController);
//# sourceMappingURL=training.controller.js.map