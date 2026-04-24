import { UsersService } from './users.service';
import { RolesService } from '../access/roles.service';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    private readonly rolesService;
    constructor(usersService: UsersService, rolesService: RolesService);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    create(userData: Partial<User> & {
        password?: string;
        roleIds?: string[];
    }): Promise<User>;
    update(id: string, userData: Partial<User> & {
        roleIds?: string[];
    }): Promise<User>;
    updateRoles(id: string, body: {
        roleIds: string[];
    }): Promise<User>;
    remove(id: string): Promise<void>;
}
