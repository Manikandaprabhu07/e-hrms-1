import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Training } from './entities/training.entity';
import { TrainingAssignment } from './entities/training-assignment.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TrainingService {
    constructor(
        @InjectRepository(Training)
        private trainingRepository: Repository<Training>,
        @InjectRepository(TrainingAssignment)
        private assignmentsRepository: Repository<TrainingAssignment>,
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
        private notificationsService: NotificationsService,
        private usersService: UsersService,
    ) { }

    findAll(): Promise<Training[]> {
        return this.trainingRepository.find({ relations: ['participants'] });
    }

    private async syncTrainingParticipants(trainingId: string, employees: Employee[]): Promise<void> {
        if (!employees.length) return;

        const training = await this.trainingRepository.findOne({
            where: { id: trainingId },
            relations: ['participants'],
        });

        if (!training) return;

        const existingParticipants = training.participants || [];
        const seen = new Set(existingParticipants.map((participant) => participant.id));

        for (const employee of employees) {
            if (seen.has(employee.id)) continue;
            existingParticipants.push(employee);
            seen.add(employee.id);
        }

        training.participants = existingParticipants;
        await this.trainingRepository.save(training);
    }

    private normalizeFilterValue(v: any): string | null {
        if (v === undefined || v === null) return null;
        const s = String(v).trim().toLowerCase();
        return s ? s : null;
    }

    private async resolveEmployeesForAssignment(input: any, training: Training): Promise<Employee[]> {
        // Explicit list wins
        if (Array.isArray(input?.participantEmployeeIds) && input.participantEmployeeIds.length) {
            return this.employeesRepository.find({
                where: input.participantEmployeeIds.map((id: string) => ({ id })) as any,
            });
        }

        const dept = this.normalizeFilterValue(input?.targetDepartment ?? training.targetDepartment);
        const role = this.normalizeFilterValue(input?.targetRole ?? training.targetRole);

        // Frappe-like default: if no department/role filter is provided, assign to all employees.
        const all = await this.employeesRepository.find();
        return all.filter((e) => {
            const empDept = this.normalizeFilterValue(e.department) || '';
            const empRole = this.normalizeFilterValue(e.designation) || '';
            const okDept = dept ? empDept === dept : true;
            const okRole = role ? empRole === role : true;
            return okDept && okRole;
        });
    }

    private async assignTrainingToEmployees(training: Training, employees: Employee[], notify: boolean): Promise<{ inserted: number }> {
        let inserted = 0;

        for (const employee of employees) {
            const a = this.assignmentsRepository.create();
            a.training = training as any;
            a.employee = employee as any;
            a.status = 'Assigned' as any;
            a.progress = 0;
            a.completedAt = null;

            try {
                await this.assignmentsRepository.save(a);
                inserted += 1;
            } catch (e: any) {
                // Unique constraint (training, employee) already exists -> ignore. Anything else should surface.
                if (String(e?.code) === '23505') continue;
                throw e;
            }
        }

        await this.syncTrainingParticipants(training.id, employees);

        if (notify && employees.length) {
            const userIds = employees.map((e) => e.userId).filter(Boolean) as string[];
            await this.notificationsService.createForUsers({
                userIds,
                type: 'training',
                title: 'New training assigned',
                message: `You have been assigned a new training: ${training.title}`,
                link: '/training',
                meta: { trainingId: training.id },
            });
        }

        return { inserted };
    }

    async findMyAssignments(userId: string): Promise<TrainingAssignment[]> {
        const employee = await this.employeesRepository.findOne({ where: { userId } });
        if (!employee) {
            throw new NotFoundException('Employee record not found for this user.');
        }
        return this.assignmentsRepository.find({
            where: { employee: { id: employee.id } as any },
            relations: ['training', 'employee'],
            order: { updatedAt: 'DESC' } as any,
        });
    }

    async findOne(id: string): Promise<Training> {
        const training = await this.trainingRepository.findOne({
            where: { id },
            relations: ['participants'],
        });
        if (!training) {
            throw new NotFoundException(`Training with ID ${id} not found`);
        }
        return training;
    }

    async listAssignmentsForTraining(trainingId: string): Promise<TrainingAssignment[]> {
        const training = await this.trainingRepository.findOne({ where: { id: trainingId } });
        if (!training) throw new NotFoundException('Training not found');

        return this.assignmentsRepository.find({
            where: { training: { id: trainingId } as any },
            relations: ['employee', 'training'],
            order: { updatedAt: 'DESC' } as any,
        });
    }

    create(trainingData: Partial<Training>): Promise<Training> {
        const training = this.trainingRepository.create(trainingData);
        return this.trainingRepository.save(training);
    }

    async createWithAssignments(input: any): Promise<Training> {
        const training = this.trainingRepository.create({
            title: input.title,
            description: input.description,
            trainer: input.trainer,
            startDate: input.startDate,
            endDate: input.endDate,
            status: input.status || 'Upcoming',
            isActive: input.isActive ?? true,
            targetDepartment: input.targetDepartment || null,
            targetRole: input.targetRole || null,
        });
        const saved = await this.trainingRepository.save(training);

        const employees = await this.resolveEmployeesForAssignment(input, saved);
        await this.assignTrainingToEmployees(saved, employees, true);

        return saved;
    }

    async backfillAssignments(trainingId: string, input: any = {}): Promise<{ inserted: number; targeted: number }> {
        const training = await this.trainingRepository.findOne({ where: { id: trainingId } });
        if (!training) throw new NotFoundException('Training not found');

        const employees = await this.resolveEmployeesForAssignment(input, training);
        const { inserted } = await this.assignTrainingToEmployees(training, employees, false);
        return { inserted, targeted: employees.length };
    }

    async updateMyProgress(userId: string, assignmentId: string, progress: number): Promise<TrainingAssignment> {
        const employee = await this.employeesRepository.findOne({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee record not found for this user.');

        const assignment = await this.assignmentsRepository.findOne({
            where: { id: assignmentId },
            relations: ['employee', 'training'],
        });
        if (!assignment) throw new NotFoundException('Training assignment not found');
        if ((assignment.employee as any).id !== employee.id) throw new BadRequestException('Not your assignment');

        const p = Math.max(0, Math.min(100, Number(progress)));
        assignment.progress = p;
        assignment.status = p >= 100 ? 'Completed' : (p > 0 ? 'InProgress' : 'Assigned');
        assignment.completedAt = p >= 100 ? new Date() : null;

        const saved = await this.assignmentsRepository.save(assignment);

        // notify admin when completed
        if (p >= 100) {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@hrms.com';
            const admin = await this.usersService.findOneByEmail(adminEmail);
            if (admin) {
                await this.notificationsService.createForUser({
                    userId: admin.id,
                    type: 'training',
                    title: 'Training completed',
                    message: `${employee.firstName} ${employee.lastName} completed: ${assignment.training.title}`,
                    link: '/training',
                    meta: { assignmentId: saved.id, trainingId: assignment.training.id, employeeId: employee.id },
                });
            }
        }

        return saved;
    }

    async update(id: string, trainingData: Partial<Training>): Promise<Training> {
        await this.trainingRepository.update(id, trainingData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.trainingRepository.delete(id);
    }
}
