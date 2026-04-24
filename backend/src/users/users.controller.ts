import { Controller, Get, Post, Patch, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesService } from '../access/roles.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@Roles('ADMIN')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
    ) { }

    @Get()
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<User> {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    @Post()
    async create(@Body() userData: Partial<User> & { password?: string; roleIds?: string[] }): Promise<User> {
        const roles = userData.roleIds?.length
            ? await this.rolesService.findManyByIds(userData.roleIds)
            : [];
        const password = userData.password
            ? await bcrypt.hash(userData.password, 10)
            : await bcrypt.hash('ChangeMe@123', 10);

        return this.usersService.create({
            ...userData,
            password,
            roles,
        });
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() userData: Partial<User> & { roleIds?: string[] }): Promise<User> {
        const roles = userData.roleIds?.length
            ? await this.rolesService.findManyByIds(userData.roleIds)
            : undefined;

        const updates: any = {
            ...userData,
            roles,
        };

        if (userData.password) {
            updates.password = await bcrypt.hash(userData.password, 10);
        } else {
            delete updates.password;
        }

        return this.usersService.update(id, updates);
    }

    @Patch(':id/roles')
    async updateRoles(@Param('id') id: string, @Body() body: { roleIds: string[] }): Promise<User> {
        const roles = await this.rolesService.findManyByIds(body.roleIds || []);
        return this.usersService.update(id, { roles });
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.usersService.remove(id);
    }
}
