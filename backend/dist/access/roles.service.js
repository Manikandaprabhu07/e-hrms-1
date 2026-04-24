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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
let RolesService = class RolesService {
    constructor(rolesRepository, permissionsRepository) {
        this.rolesRepository = rolesRepository;
        this.permissionsRepository = permissionsRepository;
    }
    findAll() {
        return this.rolesRepository.find();
    }
    async findOne(id) {
        const role = await this.rolesRepository.findOne({ where: { id } });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }
    findByName(name) {
        return this.rolesRepository.findOne({ where: { name } });
    }
    async create(roleData) {
        const role = this.rolesRepository.create(roleData);
        if (roleData.permissions) {
            role.permissions = roleData.permissions;
        }
        if (roleData.permissionIds?.length) {
            role.permissions = await this.permissionsRepository.find({ where: { id: (0, typeorm_2.In)(roleData.permissionIds) } });
        }
        return this.rolesRepository.save(role);
    }
    async update(id, roleData) {
        const role = await this.findOne(id);
        Object.assign(role, roleData);
        if (roleData.permissions) {
            role.permissions = roleData.permissions;
        }
        if (roleData.permissionIds) {
            role.permissions = await this.permissionsRepository.find({ where: { id: (0, typeorm_2.In)(roleData.permissionIds) } });
        }
        return this.rolesRepository.save(role);
    }
    findManyByIds(ids) {
        return this.rolesRepository.find({ where: { id: (0, typeorm_2.In)(ids) } });
    }
    async remove(id) {
        await this.rolesRepository.delete(id);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map