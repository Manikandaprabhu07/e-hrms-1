import { DashboardService } from './dashboard.service';
import { EmployeesService } from '../employees/employees.service';
export declare class DashboardController {
    private readonly dashboardService;
    private readonly employeesService;
    constructor(dashboardService: DashboardService, employeesService: EmployeesService);
    getAdminDashboard(): Promise<{
        totals: {
            totalEmployees: number;
            newHiresThisYear: number;
            exitsThisYear: number;
            employeesJoiningThisQuarter: number;
            employeesRelievingThisQuarter: number;
        };
        departmentCounts: any[];
        ageBuckets: {
            '18-25': number;
            '26-35': number;
            '36-45': number;
            '46-55': number;
            '56+': number;
        };
        pendingLeaveRequests: import("../leave/entities/leave.entity").Leave[];
        recentActivities: {
            id: string;
            user: string;
            action: string;
            type: string;
            timeAgo: string;
            image: string;
        }[];
        upcomingEvents: import("../events/entities/event.entity").Event[];
    }>;
    getEmployeeDashboard(req: any): Promise<{
        leaveSummary: {
            pending: number;
            approved: number;
            rejected: number;
        };
        upcomingEvents: import("../events/entities/event.entity").Event[];
    } | {
        leaveSummary: {
            pending: number;
            approved: number;
            rejected: number;
        };
    }>;
}
