import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Training } from './training.entity';
import { Employee } from '../../employees/entities/employee.entity';

export type TrainingAssignmentStatus = 'Assigned' | 'InProgress' | 'Completed';

@Entity('training_assignments')
@Index(['training', 'employee'], { unique: true })
export class TrainingAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Training, { onDelete: 'CASCADE' })
  training: Training;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  employee: Employee;

  @Column({ default: 'Assigned' })
  status: TrainingAssignmentStatus;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

