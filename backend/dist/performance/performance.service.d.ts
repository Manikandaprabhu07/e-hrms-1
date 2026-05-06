import { Repository } from 'typeorm';
import { Performance } from './entities/performance.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class PerformanceService {
    private performanceRepository;
    private notificationsService;
    constructor(performanceRepository: Repository<Performance>, notificationsService: NotificationsService);
    findAll(): Promise<Performance[]>;
    findOne(id: string): Promise<Performance>;
    create(performanceData: Partial<Performance>): Promise<Performance>;
    update(id: string, performanceData: Partial<Performance>): Promise<Performance>;
    remove(id: string): Promise<void>;
}
