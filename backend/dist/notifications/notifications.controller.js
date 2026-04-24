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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const notifications_service_1 = require("./notifications.service");
const users_service_1 = require("../users/users.service");
let NotificationsController = class NotificationsController {
    constructor(notificationsService, usersService) {
        this.notificationsService = notificationsService;
        this.usersService = usersService;
    }
    my(req) {
        return this.notificationsService.getMy(req.user.id);
    }
    async unreadCount(req) {
        return { count: await this.notificationsService.unreadCount(req.user.id) };
    }
    async readAll(req) {
        await this.notificationsService.markAllRead(req.user.id);
        return { ok: true };
    }
    async readOne(req, id) {
        await this.notificationsService.markRead(req.user.id, id);
        return { ok: true };
    }
    async create(body) {
        if (body.userIds?.length) {
            await this.notificationsService.createForUsers({
                userIds: body.userIds,
                type: body.type,
                title: body.title,
                message: body.message,
                link: body.link,
                meta: body.meta,
            });
            return { ok: true };
        }
        let userId = body.userId;
        if (!userId && body.email) {
            const u = await this.usersService.findOneByEmail(String(body.email));
            userId = u?.id;
        }
        if (!userId) {
            throw new common_1.BadRequestException('userId (or userIds/email) is required');
        }
        return this.notificationsService.createForUser({
            userId,
            type: body.type,
            title: body.title,
            message: body.message,
            link: body.link,
            meta: body.meta,
        });
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)('my'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "my", null);
__decorate([
    (0, common_1.Get)('my/unread-count'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "unreadCount", null);
__decorate([
    (0, common_1.Patch)('my/read-all'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "readAll", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "readOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "create", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        users_service_1.UsersService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map