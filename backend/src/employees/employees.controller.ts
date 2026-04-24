import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Request,
    NotFoundException,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('employees')
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    @Roles('ADMIN', 'EMPLOYEE')
    findAll(): Promise<Employee[]> {
        return this.employeesService.findAll();
    }

    @Get('me')
    @Roles('EMPLOYEE')
    async me(@Request() req: any): Promise<Employee> {
        const employee = await this.employeesService.findByUserId(req.user.id);
        if (!employee) {
            throw new NotFoundException('Employee profile not found for this user.');
        }
        return employee;
    }

    @Get(':id')
    @Roles('ADMIN', 'EMPLOYEE')
    findOne(@Param('id') id: string): Promise<Employee> {
        return this.employeesService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() employeeData: Partial<Employee> & { user?: { username?: string; password?: string; roleName?: string } }): Promise<Employee> {
        return this.employeesService.create(employeeData);
    }

    @Post('upload-preview')
    @Roles('ADMIN')
    @UseInterceptors(FileInterceptor('file'))
    uploadPreview(@UploadedFile() file: any) {
        return this.employeesService.uploadPreview(file);
    }

    @Post('save-import')
    @Roles('ADMIN')
    saveImportedEmployees(@Body() employees: any[]) {
        return this.employeesService.saveImportedEmployees(employees);
    }

    @Patch(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() employeeData: Partial<Employee> & { user?: { username?: string; password?: string; roleName?: string } }): Promise<Employee> {
        return this.employeesService.update(id, employeeData);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id') id: string): Promise<void> {
        return this.employeesService.remove(id);
    }
}
