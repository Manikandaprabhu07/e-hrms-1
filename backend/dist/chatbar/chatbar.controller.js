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
exports.ChatbarController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const notifications_service_1 = require("../notifications/notifications.service");
const messages_service_1 = require("../messages/messages.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../messages/entities/message.entity");
const conversation_entity_1 = require("../messages/entities/conversation.entity");
let ChatbarController = class ChatbarController {
    constructor(notificationsService, messagesService, messageRepo, convRepo) {
        this.notificationsService = notificationsService;
        this.messagesService = messagesService;
        this.messageRepo = messageRepo;
        this.convRepo = convRepo;
    }
    async overview(req) {
        const userId = req.user.id;
        const unreadNotifications = await this.notificationsService.unreadCount(userId);
        const convs = await this.convRepo.find({
            where: [{ adminUserId: userId }, { employeeUserId: userId }],
        });
        let unreadMessages = 0;
        for (const conv of convs) {
            unreadMessages += await this.messageRepo.count({
                where: userId === conv.adminUserId
                    ? { conversation: { id: conv.id }, unreadForAdmin: true }
                    : { conversation: { id: conv.id }, unreadForEmployee: true },
            });
        }
        return {
            unreadNotifications,
            unreadMessages,
        };
    }
};
exports.ChatbarController = ChatbarController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatbarController.prototype, "overview", null);
exports.ChatbarController = ChatbarController = __decorate([
    (0, common_1.Controller)('chatbar'),
    __param(2, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(3, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        messages_service_1.MessagesService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChatbarController);
//# sourceMappingURL=chatbar.controller.js.map