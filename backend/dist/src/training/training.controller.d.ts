import { TrainingService } from './training.service';
import { Training } from './entities/training.entity';
export declare class TrainingController {
    private readonly trainingService;
    constructor(trainingService: TrainingService);
    findAll(): Promise<Training[]>;
    my(req: any): Promise<import("./entities/training-assignment.entity").TrainingAssignment[]>;
    findOne(id: string): Promise<Training>;
    assignments(id: string): Promise<import("./entities/training-assignment.entity").TrainingAssignment[]>;
    create(trainingData: any): Promise<Training>;
    backfill(id: string): Promise<{
        inserted: number;
        targeted: number;
    }>;
    update(id: string, trainingData: Partial<Training>): Promise<Training>;
    updateProgress(req: any, assignmentId: string, body: any): Promise<import("./entities/training-assignment.entity").TrainingAssignment>;
    remove(id: string): Promise<void>;
}
