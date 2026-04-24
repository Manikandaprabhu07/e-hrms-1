import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('performance')
export class Performance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Employee, (employee) => employee.id)
    employee: Employee;

    @Column()
    reviewPeriod: string; // e.g., "Q1 2024"

    @Column({ type: 'int' })
    rating: number; // 1-5 scale

    @Column({ type: 'text' })
    feedback: string;

    @Column({ type: 'text', nullable: true })
    goals: string;

    @Column({ type: 'text', nullable: true })
    achievements: string;

    @Column()
    reviewer: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
