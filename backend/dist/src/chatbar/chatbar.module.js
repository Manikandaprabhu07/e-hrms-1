"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbarModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chatbar_controller_1 = require("./chatbar.controller");
const notifications_module_1 = require("../notifications/notifications.module");
const messages_module_1 = require("../messages/messages.module");
const message_entity_1 = require("../messages/entities/message.entity");
const conversation_entity_1 = require("../messages/entities/conversation.entity");
let ChatbarModule = class ChatbarModule {
};
exports.ChatbarModule = ChatbarModule;
exports.ChatbarModule = ChatbarModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notifications_module_1.NotificationsModule,
            messages_module_1.MessagesModule,
            typeorm_1.TypeOrmModule.forFeature([message_entity_1.Message, conversation_entity_1.Conversation]),
        ],
        controllers: [chatbar_controller_1.ChatbarController],
    })
], ChatbarModule);
//# sourceMappingURL=chatbar.module.js.map