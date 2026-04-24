import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('permissions')
@Roles('ADMIN')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Get()
    findAll(): Promise<Permission[]> {
        return this.permissionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Permission> {
        return this.permissionsService.findOne(id);
    }

    @Post()
    create(@Body() permissionData: Partial<Permission>): Promise<Permission> {
        return this.permissionsService.create(permissionData);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() permissionData: Partial<Permission>): Promise<Permission> {
        return this.permissionsService.update(id, permissionData);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.permissionsService.remove(id);
    }
}
