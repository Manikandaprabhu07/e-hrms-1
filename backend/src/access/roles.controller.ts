import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Roles as RolesDecorator } from '../auth/decorators/roles.decorator';

@Controller('roles')
@RolesDecorator('ADMIN')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    findAll(): Promise<Role[]> {
        return this.rolesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Role> {
        return this.rolesService.findOne(id);
    }

    @Post()
    create(@Body() roleData: Partial<Role> & { permissionIds?: string[] }): Promise<Role> {
        return this.rolesService.create(roleData);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() roleData: Partial<Role> & { permissionIds?: string[] }): Promise<Role> {
        return this.rolesService.update(id, roleData);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.rolesService.remove(id);
    }
}
