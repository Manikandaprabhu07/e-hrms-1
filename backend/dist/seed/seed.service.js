"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const roles_service_1 = require("../access/roles.service");
const permissions_service_1 = require("../access/permissions.service");
const events_service_1 = require("../events/events.service");
const bcrypt = __importStar(require("bcrypt"));
let SeedService = class SeedService {
    constructor(usersService, rolesService, permissionsService, eventsService) {
        this.usersService = usersService;
        this.rolesService = rolesService;
        this.permissionsService = permissionsService;
        this.eventsService = eventsService;
    }
    async onModuleInit() {
        await this.ensureDefaultPermissions();
        await this.ensureDefaultRoles();
        await this.ensureAdminUser();
        await this.ensureDefaultEvents();
    }
    async ensureDefaultPermissions() {
        const defaults = [
            { name: 'employees.read', resource: 'employees', action: 'read', description: 'View employees' },
            { name: 'employees.write', resource: 'employees', action: 'write', description: 'Create/update employees' },
            { name: 'employees.delete', resource: 'employees', action: 'delete', description: 'Delete employees' },
            { name: 'leave.read', resource: 'leave', action: 'read', description: 'View leave requests' },
            { name: 'leave.write', resource: 'leave', action: 'write', description: 'Create leave requests' },
            { name: 'leave.approve', resource: 'leave', action: 'approve', description: 'Approve/reject leave' },
            { name: 'feedback.read', resource: 'feedback', action: 'read', description: 'View feedback' },
            { name: 'feedback.write', resource: 'feedback', action: 'write', description: 'Send feedback' },
            { name: 'roles.manage', resource: 'roles', action: 'manage', description: 'Manage roles' },
            { name: 'permissions.manage', resource: 'permissions', action: 'manage', description: 'Manage permissions' },
            { name: 'users.manage', resource: 'users', action: 'manage', description: 'Manage users' },
            { name: 'events.write', resource: 'events', action: 'write', description: 'Manage events' },
        ];
        for (const perm of defaults) {
            const existing = await this.permissionsService.findByName(perm.name);
            if (!existing) {
                await this.permissionsService.create(perm);
            }
        }
    }
    async ensureDefaultRoles() {
        const allPermissions = await this.permissionsService.findAll();
        const employeePermissions = allPermissions.filter((p) => ['employees.read', 'leave.read', 'leave.write', 'feedback.write', 'dashboard.read', 'events.read'].includes(p.name));
        const adminRole = await this.rolesService.findByName('ADMIN');
        if (!adminRole) {
            await this.rolesService.create({
                name: 'ADMIN',
                description: 'System administrator',
                permissions: allPermissions,
            });
        }
        const employeeRole = await this.rolesService.findByName('EMPLOYEE');
        if (!employeeRole) {
            await this.rolesService.create({
                name: 'EMPLOYEE',
                description: 'Employee role',
                permissions: employeePermissions,
            });
        }
    }
    async ensureAdminUser() {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@hrms.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123';
        const existing = await this.usersService.findOneByEmail(adminEmail);
        if (existing) {
            return;
        }
        const adminRole = await this.rolesService.findByName('ADMIN');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await this.usersService.create({
            email: adminEmail,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            username: 'admin',
            roles: adminRole ? [adminRole] : [],
            isActive: true,
        });
    }
    async ensureDefaultEvents() {
        const existing = await this.eventsService.findUpcoming();
        if (existing.length > 0) {
            return;
        }
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        await this.eventsService.create({
            title: 'Welcome Lunch',
            description: 'Join the team for a welcome lunch in the main lounge.',
            date: tomorrow.toISOString().split('T')[0],
        });
        await this.eventsService.create({
            title: 'Monthly Town Hall',
            description: 'Company-wide town hall to share updates and celebrate wins.',
            date: nextWeek.toISOString().split('T')[0],
        });
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        roles_service_1.RolesService,
        permissions_service_1.PermissionsService,
        events_service_1.EventsService])
], SeedService);
//# sourceMappingURL=seed.service.js.map