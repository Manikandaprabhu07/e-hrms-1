import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
        private notificationsService: NotificationsService,
    ) { }

    findAll(): Promise<Attendance[]> {
        return this.attendanceRepository.find({
            relations: ['employee'],
            order: { date: 'DESC', createdAt: 'DESC' } as any,
        });
    }

    async findForEmployee(employeeId: string): Promise<Attendance[]> {
        return this.attendanceRepository.find({
            where: { employee: { id: employeeId } as any },
            relations: ['employee'],
            order: { date: 'DESC', createdAt: 'DESC' } as any,
        });
    }

    async findForUser(userId: string): Promise<Attendance[]> {
        const employee = await this.employeesRepository.findOne({ where: { userId } });
        if (!employee) {
            throw new NotFoundException('Employee record not found for this user.');
        }
        return this.findForEmployee(employee.id);
    }

    async findOne(id: string): Promise<Attendance> {
        const record = await this.attendanceRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!record) {
            throw new NotFoundException(`Attendance record with ID ${id} not found`);
        }
        return record;
    }

    async createForEmployee(attendanceData: {
        employeeId: string;
        date: string;
        status?: string;
        clockIn?: string | Date | null;
        clockOut?: string | Date | null;
    }): Promise<Attendance> {
        if (!attendanceData.employeeId) {
            throw new BadRequestException('employeeId is required');
        }
        if (!attendanceData.date) {
            throw new BadRequestException('date is required');
        }

        const employee = await this.employeesRepository.findOne({ where: { id: attendanceData.employeeId } });
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${attendanceData.employeeId} not found`);
        }

        // Prevent duplicates for the same employee + date: update existing if present.
        const existing = await this.attendanceRepository.findOne({
            where: { employee: { id: employee.id } as any, date: attendanceData.date } as any,
            relations: ['employee'],
        });

        const record = existing ?? this.attendanceRepository.create();
        record.employee = employee;
        record.date = attendanceData.date;
        record.status = (attendanceData.status ?? 'present').toString().toLowerCase();
        record.clockIn = attendanceData.clockIn ? new Date(attendanceData.clockIn as any) : null;
        record.clockOut = attendanceData.clockOut ? new Date(attendanceData.clockOut as any) : null;

        const saved = await this.attendanceRepository.save(record);

        if (employee.userId) {
            await this.notificationsService.createForUser({
                userId: employee.userId,
                type: 'attendance',
                title: 'Attendance updated',
                message: `Attendance marked for ${record.date}: ${record.status}`,
                link: '/attendance',
                meta: { attendanceId: saved.id, date: record.date },
            });
        }

        return saved;
    }

    async update(id: string, attendanceData: Partial<Attendance>): Promise<Attendance> {
        await this.attendanceRepository.update(id, attendanceData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.attendanceRepository.delete(id);
    }
}
