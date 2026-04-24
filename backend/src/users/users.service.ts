import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
    ) { }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findOneByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
        const directUser = await this.usersRepository.findOne({
            where: [
                { email: emailOrUsername },
                { username: emailOrUsername },
            ],
        });

        if (directUser) {
            return directUser;
        }

        const employee = await this.employeesRepository.findOne({
            where: { employeeId: emailOrUsername },
        });

        if (!employee?.userId) {
            return null;
        }

        return this.usersRepository.findOne({ where: { id: employee.userId } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOne(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async update(id: string, userData: Partial<User>): Promise<User> {
        const user = await this.findOne(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }
        Object.assign(user, userData);
        return this.usersRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.delete(id);
    }
}
