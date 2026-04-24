import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { Payroll } from './entities/payroll.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payroll')
export class PayrollController {
    constructor(private readonly payrollService: PayrollService) { }

    @Get()
    @Roles('ADMIN')
    findAll(): Promise<Payroll[]> {
        return this.payrollService.findAll();
    }

    @Get('my')
    @Roles('EMPLOYEE')
    my(@Request() req: any): Promise<Payroll[]> {
        return this.payrollService.findForUser(req.user.id);
    }

    @Get(':id')
    @Roles('ADMIN')
    findOne(@Param('id') id: string): Promise<Payroll> {
        return this.payrollService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() payrollData: any): Promise<Payroll> {
        return this.payrollService.createForEmployee(payrollData);
    }

    @Patch(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() payrollData: Partial<Payroll>): Promise<Payroll> {
        return this.payrollService.update(id, payrollData);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id') id: string): Promise<void> {
        return this.payrollService.remove(id);
    }
}
