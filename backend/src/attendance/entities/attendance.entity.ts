import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('attendance')
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Employee, (employee) => employee.id)
    employee: Employee;

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'timestamp', nullable: true })
    clockIn: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    clockOut: Date | null;

    @Column({ nullable: true })
    status: string; // Present, Absent, Latent, etc.

    @CreateDateColumn()
    createdAt: Date;
}
