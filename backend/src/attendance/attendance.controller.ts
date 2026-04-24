import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Get()
    @Roles('ADMIN')
    findAll(): Promise<Attendance[]> {
        return this.attendanceService.findAll();
    }

    @Get('employee/:employeeId')
    @Roles('ADMIN')
    findForEmployee(@Param('employeeId') employeeId: string): Promise<Attendance[]> {
        return this.attendanceService.findForEmployee(employeeId);
    }

    @Get('my')
    @Roles('EMPLOYEE')
    findMy(@Request() req: any): Promise<Attendance[]> {
        return this.attendanceService.findForUser(req.user.id);
    }

    @Get(':id')
    @Roles('ADMIN')
    findOne(@Param('id') id: string): Promise<Attendance> {
        return this.attendanceService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() attendanceData: { employeeId: string; date: string; status?: string; clockIn?: string | null; clockOut?: string | null }): Promise<Attendance> {
        return this.attendanceService.createForEmployee(attendanceData);
    }

    @Patch(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() attendanceData: Partial<Attendance>): Promise<Attendance> {
        return this.attendanceService.update(id, attendanceData);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id') id: string): Promise<void> {
        return this.attendanceService.remove(id);
    }
}
