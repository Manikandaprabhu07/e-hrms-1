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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const roles_service_1 = require("../access/roles.service");
const jwt_secret_1 = require("./jwt-secret");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService, rolesService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.rolesService = rolesService;
    }
    async validateUser(emailOrUsername, pass) {
        const user = await this.usersService.findOneByEmailOrUsername(emailOrUsername);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const roles = user.roles || [];
        const payload = { email: user.email, sub: user.id, roles: roles.map((r) => r.name) };
        let jwtSecret;
        try {
            jwtSecret = (0, jwt_secret_1.getJwtSecret)(this.configService);
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e?.message ?? 'JWT secret not configured.');
        }
        return {
            accessToken: this.jwtService.sign(payload, {
                secret: jwtSecret,
                expiresIn: '1d',
            }),
            expiresIn: 3600,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: roles,
            },
        };
    }
    async register(userData) {
        const existingUser = await this.usersService.findOneByEmail(userData.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const employeeRole = await this.rolesService.findByName('EMPLOYEE');
        const user = await this.usersService.create({
            ...userData,
            password: hashedPassword,
            roles: employeeRole ? [employeeRole] : [],
        });
        const { password, ...result } = user;
        return result;
    }
    async registerAdmin(userData) {
        const adminSecret = process.env.ADMIN_SECRET;
        if (!adminSecret || userData.adminSecret !== adminSecret) {
            throw new common_1.UnauthorizedException('Invalid admin registration secret');
        }
        const existingUser = await this.usersService.findOneByEmail(userData.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const adminRole = await this.rolesService.findByName('ADMIN');
        const user = await this.usersService.create({
            ...userData,
            password: hashedPassword,
            roles: adminRole ? [adminRole] : [],
        });
        const { password, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        roles_service_1.RolesService])
], AuthService);
//# sourceMappingURL=auth.service.js.map