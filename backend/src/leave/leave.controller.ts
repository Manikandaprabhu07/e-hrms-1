import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { Leave } from './entities/leave.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { EmployeesService } from '../employees/employees.service';

@Controller('leave')
export class LeaveController {
    constructor(
        private readonly leaveService: LeaveService,
        private readonly employeesService: EmployeesService,
    ) { }

    @Get()
    @Roles('ADMIN')
    findAll(): Promise<Leave[]> {
        return this.leaveService.findAll();
    }

    @Get('pending')
    @Roles('ADMIN')
    findPending(): Promise<Leave[]> {
        return this.leaveService.findPending();
    }

    @Get('my')
    @Roles('EMPLOYEE', 'ADMIN')
    async findMy(@Request() req: any): Promise<Leave[]> {
        const user = req.user;
        const employee = await this.employeesService.findByEmail(user.email);
        if (!employee) {
            return [];
        }
        return this.leaveService.findByEmployee(employee.id);
    }

    @Get(':id')
    @Roles('ADMIN', 'EMPLOYEE')
    findOne(@Param('id') id: string): Promise<Leave> {
        return this.leaveService.findOne(id);
    }

    @Post()
    @Roles('EMPLOYEE', 'ADMIN')
    async create(@Body() leaveData: Partial<Leave> & { employeeId?: string }, @Request() req: any): Promise<Leave> {
        if (!leaveData.employeeId) {
            const employee = await this.employeesService.findByEmail(req.user.email);
            if (employee) {
                leaveData.employeeId = employee.id;
            }
        }
        return this.leaveService.create(leaveData);
    }

    @Patch(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() leaveData: Partial<Leave>): Promise<Leave> {
        return this.leaveService.update(id, leaveData);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id') id: string): Promise<void> {
        return this.leaveService.remove(id);
    }
}
