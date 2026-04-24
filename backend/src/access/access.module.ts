import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { PermissionsService } from './permissions.service';
import { RolesService } from './roles.service';
import { PermissionsController } from './permissions.controller';
import { RolesController } from './roles.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Permission, Role])],
    providers: [PermissionsService, RolesService],
    controllers: [PermissionsController, RolesController],
    exports: [PermissionsService, RolesService, TypeOrmModule],
})
export class AccessModule { }
