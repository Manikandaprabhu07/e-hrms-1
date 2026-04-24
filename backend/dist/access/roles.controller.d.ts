import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<Role>;
    create(roleData: Partial<Role> & {
        permissionIds?: string[];
    }): Promise<Role>;
    update(id: string, roleData: Partial<Role> & {
        permissionIds?: string[];
    }): Promise<Role>;
    remove(id: string): Promise<void>;
}
