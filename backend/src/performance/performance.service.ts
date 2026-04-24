import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Performance } from './entities/performance.entity';

@Injectable()
export class PerformanceService {
    constructor(
        @InjectRepository(Performance)
        private performanceRepository: Repository<Performance>,
    ) { }

    findAll(): Promise<Performance[]> {
        return this.performanceRepository.find({ relations: ['employee'] });
    }

    async findOne(id: string): Promise<Performance> {
        const record = await this.performanceRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!record) {
            throw new NotFoundException(`Performance record with ID ${id} not found`);
        }
        return record;
    }

    create(performanceData: Partial<Performance>): Promise<Performance> {
        const record = this.performanceRepository.create(performanceData);
        return this.performanceRepository.save(record);
    }

    async update(id: string, performanceData: Partial<Performance>): Promise<Performance> {
        await this.performanceRepository.update(id, performanceData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.performanceRepository.delete(id);
    }
}
