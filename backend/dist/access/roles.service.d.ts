import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
export declare class RolesService {
    private rolesRepository;
    private permissionsRepository;
    constructor(rolesRepository: Repository<Role>, permissionsRepository: Repository<Permission>);
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<Role>;
    findByName(name: string): Promise<Role | null>;
    create(roleData: Partial<Role> & {
        permissionIds?: string[];
    }): Promise<Role>;
    update(id: string, roleData: Partial<Role> & {
        permissionIds?: string[];
    }): Promise<Role>;
    findManyByIds(ids: string[]): Promise<Role[]>;
    remove(id: string): Promise<void>;
}
