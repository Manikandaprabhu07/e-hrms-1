import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('feedback')
export class Feedback {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Employee, { eager: true })
    employee: Employee;

    @Column()
    message: string;

    @CreateDateColumn()
    createdAt: Date;
}
