import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '../access/roles.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private rolesService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, rolesService: RolesService);
    validateUser(emailOrUsername: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        accessToken: string;
        expiresIn: number;
        user: {
            id: any;
            username: any;
            email: any;
            firstName: any;
            lastName: any;
            roles: any;
        };
    }>;
    register(userData: any): Promise<{
        id: string;
        username: string;
        email: string;
        profileImage: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        roles: import("../access/entities/role.entity").Role[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    registerAdmin(userData: any): Promise<{
        id: string;
        username: string;
        email: string;
        profileImage: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        roles: import("../access/entities/role.entity").Role[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}
