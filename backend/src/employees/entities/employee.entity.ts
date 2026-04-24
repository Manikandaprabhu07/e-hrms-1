import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EmploymentType {
    PERMANENT = 'permanent',
    CONTRACT = 'contract',
    TEMPORARY = 'temporary',
    PART_TIME = 'part_time',
    INTERN = 'intern'
}

export enum EmployeeStatus {
    ACTIVE = 'active',
    ON_LEAVE = 'on_leave',
    RESIGNED = 'resigned',
    TERMINATED = 'terminated',
    PROBATION = 'probation'
}

export enum WorkLocationType {
    OFFICE = 'office',
    REMOTE = 'remote',
    HYBRID = 'hybrid'
}

export enum ShiftType {
    MORNING = 'morning',
    EVENING = 'evening',
    NIGHT = 'night',
    FLEXIBLE = 'flexible'
}

@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    employeeId: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ type: 'text', nullable: true })
    avatar: string;

    @Column({ type: 'text', nullable: true })
    profilePhoto: string;

    @Column({ nullable: true })
    phone: string;

    @Column()
    department: string;

    @Column()
    designation: string;

    @Column({
        type: 'enum',
        enum: EmploymentType,
        default: EmploymentType.PERMANENT
    })
    employmentType: EmploymentType;

    @Column({
        type: 'enum',
        enum: EmployeeStatus,
        default: EmployeeStatus.ACTIVE
    })
    employmentStatus: EmployeeStatus;

    @Column({
        type: 'enum',
        enum: WorkLocationType,
        default: WorkLocationType.OFFICE
    })
    workLocation: WorkLocationType;

    @Column({
        type: 'enum',
        enum: ShiftType,
        default: ShiftType.MORNING
    })
    shift: ShiftType;

    @Column({ type: 'date' })
    dateOfJoining: Date;

    @Column({ type: 'date', nullable: true })
    dateOfResignation: Date;

    @Column({ type: 'date', nullable: true })
    dateOfBirth: Date;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    salary: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'simple-json', nullable: true })
    documents: Array<{
        id: string;
        name: string;
        category: string;
        contentType: string;
        dataUrl: string;
    }>;

    @Column({ nullable: true })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
