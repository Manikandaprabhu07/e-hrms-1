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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const messages_service_1 = require("./messages.service");
let MessagesController = class MessagesController {
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    myConversations(req) {
        return this.messagesService.listMyConversations(req.user.id);
    }
    startForEmployee(employeeId) {
        return this.messagesService.ensureConversationForEmployeeId(employeeId);
    }
    startMine(req) {
        return this.messagesService.ensureEmployeeConversation(req.user.id);
    }
    getMessages(req, id) {
        return this.messagesService.getConversationMessages(id, req.user.id);
    }
    async markRead(req, id) {
        await this.messagesService.markConversationRead(id, req.user.id);
        return { ok: true };
    }
    send(req, id, body) {
        return this.messagesService.sendMessage(id, req.user.id, body.content);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)('my/conversations'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "myConversations", null);
__decorate([
    (0, common_1.Post)('start/employee/:employeeId'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "startForEmployee", null);
__decorate([
    (0, common_1.Post)('start'),
    (0, roles_decorator_1.Roles)('EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "startMine", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Patch)('conversations/:id/read'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)('conversations/:id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "send", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)('messages'),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map