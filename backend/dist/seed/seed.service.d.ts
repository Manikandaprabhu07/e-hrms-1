import { OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RolesService } from '../access/roles.service';
import { PermissionsService } from '../access/permissions.service';
import { EventsService } from '../events/events.service';
export declare class SeedService implements OnModuleInit {
    private readonly usersService;
    private readonly rolesService;
    private readonly permissionsService;
    private readonly eventsService;
    constructor(usersService: UsersService, rolesService: RolesService, permissionsService: PermissionsService, eventsService: EventsService);
    onModuleInit(): Promise<void>;
    private ensureDefaultPermissions;
    private ensureDefaultRoles;
    private ensureAdminUser;
    private ensureDefaultEvents;
}
