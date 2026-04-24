export declare enum EmploymentType {
    PERMANENT = "permanent",
    CONTRACT = "contract",
    TEMPORARY = "temporary",
    PART_TIME = "part_time",
    INTERN = "intern"
}
export declare enum EmployeeStatus {
    ACTIVE = "active",
    ON_LEAVE = "on_leave",
    RESIGNED = "resigned",
    TERMINATED = "terminated",
    PROBATION = "probation"
}
export declare enum WorkLocationType {
    OFFICE = "office",
    REMOTE = "remote",
    HYBRID = "hybrid"
}
export declare enum ShiftType {
    MORNING = "morning",
    EVENING = "evening",
    NIGHT = "night",
    FLEXIBLE = "flexible"
}
export declare class Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    employmentType: EmploymentType;
    employmentStatus: EmployeeStatus;
    workLocation: WorkLocationType;
    shift: ShiftType;
    dateOfJoining: Date;
    dateOfResignation: Date;
    dateOfBirth: Date;
    salary: number;
    isActive: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
