import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('leaves')
export class Leave {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Employee, (employee) => employee.id)
    employee: Employee;

    @Column()
    leaveType: string; // Annual, Sick, Casual, etc.

    @Column({ type: 'date' })
    startDate: string;

    @Column({ type: 'date' })
    endDate: string;

    @Column({ default: 'Pending' })
    status: string; // Pending, Approved, Rejected

    @Column({ nullable: true })
    reason: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
