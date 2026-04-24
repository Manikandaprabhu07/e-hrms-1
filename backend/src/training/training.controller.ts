import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { TrainingService } from './training.service';
import { Training } from './entities/training.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('training')
export class TrainingController {
    constructor(private readonly trainingService: TrainingService) { }

    @Get()
    @Roles('ADMIN')
    findAll(): Promise<Training[]> {
        return this.trainingService.findAll();
    }

    @Get('my')
    @Roles('EMPLOYEE')
    my(@Request() req: any) {
        return this.trainingService.findMyAssignments(req.user.id);
    }

    @Get(':id')
    @Roles('ADMIN')
    findOne(@Param('id') id: string): Promise<Training> {
        return this.trainingService.findOne(id);
    }

    @Get(':id/assignments')
    @Roles('ADMIN')
    assignments(@Param('id') id: string) {
        return this.trainingService.listAssignmentsForTraining(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() trainingData: any): Promise<Training> {
        return this.trainingService.createWithAssignments(trainingData);
    }

    @Post(':id/assign')
    @Roles('ADMIN')
    backfill(@Param('id') id: string, @Body() body: any) {
        return this.trainingService.backfillAssignments(id, body);
    }

    @Patch(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() trainingData: Partial<Training>): Promise<Training> {
        return this.trainingService.update(id, trainingData);
    }

    @Patch('my/:assignmentId/progress')
    @Roles('EMPLOYEE')
    updateProgress(@Request() req: any, @Param('assignmentId') assignmentId: string, @Body() body: any) {
        return this.trainingService.updateMyProgress(req.user.id, assignmentId, body.progress);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id') id: string): Promise<void> {
        return this.trainingService.remove(id);
    }
}
