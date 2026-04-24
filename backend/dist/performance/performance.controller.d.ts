import { PerformanceService } from './performance.service';
import { Performance } from './entities/performance.entity';
export declare class PerformanceController {
    private readonly performanceService;
    constructor(performanceService: PerformanceService);
    findAll(): Promise<Performance[]>;
    findOne(id: string): Promise<Performance>;
    create(performanceData: Partial<Performance>): Promise<Performance>;
    update(id: string, performanceData: Partial<Performance>): Promise<Performance>;
    remove(id: string): Promise<void>;
}
