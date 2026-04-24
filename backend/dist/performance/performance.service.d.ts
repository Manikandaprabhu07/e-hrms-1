import { Repository } from 'typeorm';
import { Performance } from './entities/performance.entity';
export declare class PerformanceService {
    private performanceRepository;
    constructor(performanceRepository: Repository<Performance>);
    findAll(): Promise<Performance[]>;
    findOne(id: string): Promise<Performance>;
    create(performanceData: Partial<Performance>): Promise<Performance>;
    update(id: string, performanceData: Partial<Performance>): Promise<Performance>;
    remove(id: string): Promise<void>;
}
