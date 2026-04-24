"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const permission_entity_1 = require("./entities/permission.entity");
const role_entity_1 = require("./entities/role.entity");
const permissions_service_1 = require("./permissions.service");
const roles_service_1 = require("./roles.service");
const permissions_controller_1 = require("./permissions.controller");
const roles_controller_1 = require("./roles.controller");
let AccessModule = class AccessModule {
};
exports.AccessModule = AccessModule;
exports.AccessModule = AccessModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([permission_entity_1.Permission, role_entity_1.Role])],
        providers: [permissions_service_1.PermissionsService, roles_service_1.RolesService],
        controllers: [permissions_controller_1.PermissionsController, roles_controller_1.RolesController],
        exports: [permissions_service_1.PermissionsService, roles_service_1.RolesService, typeorm_1.TypeOrmModule],
    })
], AccessModule);
//# sourceMappingURL=access.module.js.map