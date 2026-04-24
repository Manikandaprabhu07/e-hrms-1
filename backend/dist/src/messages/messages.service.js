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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
const users_service_1 = require("../users/users.service");
const notifications_service_1 = require("../notifications/notifications.service");
const employees_service_1 = require("../employees/employees.service");
let MessagesService = class MessagesService {
    constructor(conversationsRepository, messagesRepository, usersService, employeesService, notificationsService) {
        this.conversationsRepository = conversationsRepository;
        this.messagesRepository = messagesRepository;
        this.usersService = usersService;
        this.employeesService = employeesService;
        this.notificationsService = notificationsService;
        this.cachedAdminUserId = null;
    }
    async getAdminUserId() {
        if (this.cachedAdminUserId)
            return this.cachedAdminUserId;
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@hrms.com';
        const admin = await this.usersService.findOneByEmail(adminEmail);
        if (!admin) {
            throw new common_1.NotFoundException('Admin user not found. Seed may have failed.');
        }
        this.cachedAdminUserId = admin.id;
        return admin.id;
    }
    async assertMember(conversationId, userId) {
        const conv = await this.conversationsRepository.findOne({ where: { id: conversationId } });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        if (conv.adminUserId !== userId && conv.employeeUserId !== userId) {
            throw new common_1.ForbiddenException('You are not a participant of this conversation');
        }
        return conv;
    }
    async ensureEmployeeConversation(employeeUserId) {
        const adminUserId = await this.getAdminUserId();
        const existing = await this.conversationsRepository.findOne({ where: { employeeUserId, adminUserId } });
        if (existing)
            return existing;
        const conv = this.conversationsRepository.create({ employeeUserId, adminUserId });
        return this.conversationsRepository.save(conv);
    }
    async ensureConversationForEmployeeId(employeeId) {
        const emp = await this.employeesService.findOne(employeeId);
        if (!emp.userId) {
            throw new common_1.BadRequestException('Employee does not have a login account (userId missing).');
        }
        return this.ensureEmployeeConversation(emp.userId);
    }
    async listMyConversations(userId) {
        const convs = await this.conversationsRepository.find({
            where: [{ adminUserId: userId }, { employeeUserId: userId }],
            order: { updatedAt: 'DESC' },
        });
        const result = [];
        for (const conv of convs) {
            const isAdminView = userId === conv.adminUserId;
            const emp = await this.employeesService.findByUserId(conv.employeeUserId).catch(() => null);
            const employeeName = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Employee';
            const last = await this.messagesRepository.findOne({
                where: { conversation: { id: conv.id } },
                order: { createdAt: 'DESC' },
            });
            const unreadCount = await this.messagesRepository.count({
                where: userId === conv.adminUserId
                    ? { conversation: { id: conv.id }, unreadForAdmin: true }
                    : { conversation: { id: conv.id }, unreadForEmployee: true },
            });
            result.push({
                id: conv.id,
                employeeUserId: conv.employeeUserId,
                adminUserId: conv.adminUserId,
                title: isAdminView ? employeeName : 'Admin',
                employee: emp
                    ? { id: emp.id, employeeId: emp.employeeId, name: employeeName, department: emp.department, designation: emp.designation }
                    : null,
                lastMessage: last ? { content: last.content, createdAt: last.createdAt, senderUserId: last.senderUserId } : null,
                unreadCount,
                updatedAt: conv.updatedAt,
            });
        }
        return result;
    }
    async getConversationMessages(conversationId, userId) {
        await this.assertMember(conversationId, userId);
        return this.messagesRepository.find({
            where: { conversation: { id: conversationId } },
            order: { createdAt: 'ASC' },
        });
    }
    async markConversationRead(conversationId, userId) {
        const conv = await this.assertMember(conversationId, userId);
        if (conv.adminUserId === userId) {
            await this.messagesRepository.update({ conversation: { id: conversationId } }, { unreadForAdmin: false });
        }
        else {
            await this.messagesRepository.update({ conversation: { id: conversationId } }, { unreadForEmployee: false });
        }
    }
    async sendMessage(conversationId, userId, content) {
        const conv = await this.assertMember(conversationId, userId);
        const trimmed = String(content || '').trim();
        if (!trimmed)
            throw new common_1.BadRequestException('Message content is required');
        const isAdminSender = conv.adminUserId === userId;
        const msg = this.messagesRepository.create({
            conversation: conv,
            senderUserId: userId,
            content: trimmed,
            unreadForAdmin: !isAdminSender,
            unreadForEmployee: isAdminSender,
        });
        const saved = await this.messagesRepository.save(msg);
        await this.conversationsRepository.update({ id: conv.id }, { updatedAt: new Date() });
        const toUserId = isAdminSender ? conv.employeeUserId : conv.adminUserId;
        await this.notificationsService.createForUser({
            userId: toUserId,
            type: 'message',
            title: 'New message',
            message: isAdminSender ? 'Admin sent you a message.' : 'Employee sent you a message.',
            link: '/dashboard',
            meta: { conversationId: conv.id },
        });
        return saved;
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        employees_service_1.EmployeesService,
        notifications_service_1.NotificationsService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map