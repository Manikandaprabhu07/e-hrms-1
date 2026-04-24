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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("./entities/employee.entity");
const users_service_1 = require("../users/users.service");
const roles_service_1 = require("../access/roles.service");
const bcrypt = __importStar(require("bcrypt"));
let EmployeesService = class EmployeesService {
    constructor(employeesRepository, usersService, rolesService) {
        this.employeesRepository = employeesRepository;
        this.usersService = usersService;
        this.rolesService = rolesService;
    }
    findAll() {
        return this.employeesRepository.find();
    }
    async findOne(id) {
        const employee = await this.employeesRepository.findOne({ where: { id } });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        return employee;
    }
    findByEmail(email) {
        return this.employeesRepository.findOne({ where: { email } });
    }
    findByUserId(userId) {
        return this.employeesRepository.findOne({ where: { userId } });
    }
    async create(employeeData) {
        const userInput = employeeData.user || {};
        const username = userInput.username || employeeData.username;
        const password = userInput.password || employeeData.password;
        const roleName = userInput.roleName || employeeData.roleName || employeeData.role || 'EMPLOYEE';
        let createdUserId = null;
        try {
            if (username) {
                if (!employeeData.email) {
                    throw new common_1.BadRequestException('Email is required to create a login account for the employee.');
                }
                if (!password) {
                    throw new common_1.BadRequestException('Password is required to create a login account for the employee.');
                }
                const desiredRole = await this.rolesService.findByName(String(roleName).toUpperCase());
                const fallbackRole = await this.rolesService.findByName('EMPLOYEE');
                const role = desiredRole || fallbackRole;
                const hashedPassword = await bcrypt.hash(String(password), 10);
                const user = await this.usersService.create({
                    email: employeeData.email,
                    username: String(username),
                    password: hashedPassword,
                    firstName: employeeData.firstName || 'Employee',
                    lastName: employeeData.lastName || '',
                    isActive: employeeData.isActive ?? true,
                    roles: role ? [role] : [],
                });
                createdUserId = user.id;
                employeeData.userId = user.id;
            }
            const employeeEntityData = { ...employeeData };
            delete employeeEntityData.user;
            delete employeeEntityData.username;
            delete employeeEntityData.password;
            delete employeeEntityData.roleName;
            delete employeeEntityData.role;
            const employee = this.employeesRepository.create(employeeEntityData);
            return await this.employeesRepository.save(employee);
        }
        catch (error) {
            if (createdUserId) {
                await this.usersService.remove(createdUserId);
            }
            throw error;
        }
    }
    async update(id, employeeData) {
        const existingEmployee = await this.findOne(id);
        const userInput = employeeData.user || {};
        const username = userInput.username ?? employeeData.username;
        const password = userInput.password ?? employeeData.password;
        const roleName = userInput.roleName ?? employeeData.roleName ?? employeeData.role;
        delete employeeData.user;
        delete employeeData.username;
        delete employeeData.password;
        delete employeeData.roleName;
        delete employeeData.role;
        let createdUserId = null;
        try {
            if (username !== undefined || password !== undefined || roleName !== undefined) {
                const desiredRoleName = roleName ? String(roleName).toUpperCase() : undefined;
                const desiredRole = desiredRoleName
                    ? await this.rolesService.findByName(desiredRoleName)
                    : null;
                const fallbackRole = await this.rolesService.findByName('EMPLOYEE');
                const role = desiredRole || fallbackRole;
                const emailForUser = employeeData.email ?? existingEmployee.email;
                if (!emailForUser) {
                    throw new common_1.BadRequestException('Email is required to create/update a login account for the employee.');
                }
                if (existingEmployee.userId) {
                    const patch = {};
                    if (username !== undefined)
                        patch.username = username ? String(username) : null;
                    if (employeeData.email !== undefined)
                        patch.email = String(emailForUser);
                    if (employeeData.firstName !== undefined)
                        patch.firstName = String(employeeData.firstName);
                    if (employeeData.lastName !== undefined)
                        patch.lastName = String(employeeData.lastName);
                    if (employeeData.isActive !== undefined)
                        patch.isActive = Boolean(employeeData.isActive);
                    if (password) {
                        patch.password = await bcrypt.hash(String(password), 10);
                    }
                    if (desiredRoleName && role) {
                        patch.roles = [role];
                    }
                    await this.usersService.update(existingEmployee.userId, patch);
                }
                else {
                    if (!username) {
                        throw new common_1.BadRequestException('Username is required to create a login account for the employee.');
                    }
                    if (!password) {
                        throw new common_1.BadRequestException('Password is required to create a login account for the employee.');
                    }
                    const hashedPassword = await bcrypt.hash(String(password), 10);
                    const user = await this.usersService.create({
                        email: String(emailForUser),
                        username: String(username),
                        password: hashedPassword,
                        firstName: employeeData.firstName ?? existingEmployee.firstName ?? 'Employee',
                        lastName: employeeData.lastName ?? existingEmployee.lastName ?? '',
                        isActive: employeeData.isActive ?? existingEmployee.isActive ?? true,
                        roles: role ? [role] : [],
                    });
                    createdUserId = user.id;
                    employeeData.userId = user.id;
                }
            }
            Object.assign(existingEmployee, employeeData);
            return await this.employeesRepository.save(existingEmployee);
        }
        catch (error) {
            if (createdUserId) {
                await this.usersService.remove(createdUserId);
            }
            throw error;
        }
    }
    async remove(id) {
        await this.employeesRepository.delete(id);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        roles_service_1.RolesService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map