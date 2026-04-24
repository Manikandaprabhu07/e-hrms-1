import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { Performance } from './entities/performance.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('performance')
@Roles('ADMIN')
export class PerformanceController {
    constructor(private readonly performanceService: PerformanceService) { }

    @Get()
    findAll(): Promise<Performance[]> {
        return this.performanceService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Performance> {
        return this.performanceService.findOne(id);
    }

    @Post()
    create(@Body() performanceData: Partial<Performance>): Promise<Performance> {
        return this.performanceService.create(performanceData);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() performanceData: Partial<Performance>): Promise<Performance> {
        return this.performanceService.update(id, performanceData);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.performanceService.remove(id);
    }
}
