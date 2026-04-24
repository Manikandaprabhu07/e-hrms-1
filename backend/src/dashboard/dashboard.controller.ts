import { Controller, Get, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { EmployeesService } from '../employees/employees.service';

@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly employeesService: EmployeesService,
    ) { }

    @Get('admin')
    @Roles('ADMIN')
    getAdminDashboard() {
        return this.dashboardService.getAdminDashboard();
    }

    @Get('employee')
    @Roles('EMPLOYEE', 'ADMIN')
    async getEmployeeDashboard(@Request() req: any) {
        const user = req.user;
        const employee = await this.employeesService.findByEmail(user.email);
        if (!employee) {
            return { leaveSummary: { pending: 0, approved: 0, rejected: 0 } };
        }
        return this.dashboardService.getEmployeeDashboard(employee.id);
    }
}
