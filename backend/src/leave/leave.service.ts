import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leave } from './entities/leave.entity';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class LeaveService {
    constructor(
        @InjectRepository(Leave)
        private leaveRepository: Repository<Leave>,
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
    ) { }

    findAll(): Promise<Leave[]> {
        return this.leaveRepository.find({
            relations: ['employee'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Leave> {
        const record = await this.leaveRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!record) {
            throw new NotFoundException(`Leave record with ID ${id} not found`);
        }
        return record;
    }

    async create(leaveData: Partial<Leave> & { employeeId?: string }): Promise<Leave> {
        if (leaveData.employeeId) {
            const employee = await this.employeesRepository.findOne({ where: { id: leaveData.employeeId } });
            if (!employee) {
                throw new NotFoundException('Employee not found');
            }
            leaveData.employee = employee;
        }
        const record = this.leaveRepository.create(leaveData);
        return this.leaveRepository.save(record);
    }

    async update(id: string, leaveData: Partial<Leave>): Promise<Leave> {
        await this.leaveRepository.update(id, leaveData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.leaveRepository.delete(id);
    }

    findByEmployee(employeeId: string): Promise<Leave[]> {
        return this.leaveRepository.find({
            where: { employee: { id: employeeId } as any },
            relations: ['employee'],
            order: { createdAt: 'DESC' },
        });
    }

    findPending(): Promise<Leave[]> {
        return this.leaveRepository.find({
            where: { status: 'Pending' },
            order: { createdAt: 'DESC' },
            relations: ['employee'],
        });
    }
}
