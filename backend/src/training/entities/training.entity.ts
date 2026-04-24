import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('trainings')
export class Training {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    trainer: string;

    @Column({ type: 'date' })
    startDate: string;

    @Column({ type: 'date' })
    endDate: string;

    @Column({ default: 'Upcoming' })
    status: string; // Upcoming, Ongoing, Completed, Cancelled

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    targetDepartment: string;

    @Column({ nullable: true })
    targetRole: string;

    @ManyToMany(() => Employee)
    @JoinTable()
    participants: Employee[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
