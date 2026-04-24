import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,
    ) { }

    findAll(): Promise<Role[]> {
        return this.rolesRepository.find();
    }

    async findOne(id: string): Promise<Role> {
        const role = await this.rolesRepository.findOne({ where: { id } });
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    findByName(name: string): Promise<Role | null> {
        return this.rolesRepository.findOne({ where: { name } });
    }

    async create(roleData: Partial<Role> & { permissionIds?: string[] }): Promise<Role> {
        const role = this.rolesRepository.create(roleData);
        if (roleData.permissions) {
            role.permissions = roleData.permissions as Permission[];
        }
        if (roleData.permissionIds?.length) {
            role.permissions = await this.permissionsRepository.find({ where: { id: In(roleData.permissionIds) } });
        }
        return this.rolesRepository.save(role);
    }

    async update(id: string, roleData: Partial<Role> & { permissionIds?: string[] }): Promise<Role> {
        const role = await this.findOne(id);
        Object.assign(role, roleData);
        if (roleData.permissions) {
            role.permissions = roleData.permissions as Permission[];
        }
        if (roleData.permissionIds) {
            role.permissions = await this.permissionsRepository.find({ where: { id: In(roleData.permissionIds) } });
        }
        return this.rolesRepository.save(role);
    }

    findManyByIds(ids: string[]): Promise<Role[]> {
        return this.rolesRepository.find({ where: { id: In(ids) } });
    }

    async remove(id: string): Promise<void> {
        await this.rolesRepository.delete(id);
    }
}
