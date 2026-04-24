import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
export declare class PermissionsService {
    private permissionsRepository;
    constructor(permissionsRepository: Repository<Permission>);
    findAll(): Promise<Permission[]>;
    findOne(id: string): Promise<Permission>;
    findByName(name: string): Promise<Permission | null>;
    create(permissionData: Partial<Permission>): Promise<Permission>;
    update(id: string, permissionData: Partial<Permission>): Promise<Permission>;
    remove(id: string): Promise<void>;
}
