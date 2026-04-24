/**
 * Employment type enum
 */
export enum EmploymentType {
  PERMANENT = 'permanent',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  PART_TIME = 'part_time',
  INTERN = 'intern'
}

/**
 * Employee status enum
 */
export enum EmployeeStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  RESIGNED = 'resigned',
  TERMINATED = 'terminated',
  PROBATION = 'probation'
}

/**
 * Work location type
 */
export enum WorkLocationType {
  OFFICE = 'office',
  REMOTE = 'remote',
  HYBRID = 'hybrid'
}

/**
 * Shift type
 */
export enum ShiftType {
  MORNING = 'morning',
  EVENING = 'evening',
  NIGHT = 'night',
  FLEXIBLE = 'flexible'
}

/**
 * Document type enum
 */
export enum DocumentType {
  RESUME = 'resume',
  OFFER_LETTER = 'offer_letter',
  AADHAAR = 'aadhaar',
  PAN = 'pan',
  PASSPORT = 'passport',
  CERTIFICATE = 'certificate',
  OTHER = 'other'
}

/**
 * Employee document interface
 */
export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  expiryDate?: Date;
}

/**
 * Performance record interface
 */
export interface PerformanceRecord {
  id: string;
  employeeId: string;
  reviewPeriod: {
    startDate: Date;
    endDate: Date;
  };
  rating: number; // 1-5 scale
  goals: string[];
  achievements: string[];
  areasOfImprovement: string[];
  feedback: string;
  reviewedBy: string;
  reviewedAt: Date;
}

/**
 * Audit log interface
 */
export interface AuditLog {
  id: string;
  entityType: 'employee' | 'document' | 'performance' | 'payroll';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view';
  changedBy: string;
  changedAt: Date;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
}

/**
 * Department model
 */
export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Designation/Job Title model
 */
export interface Designation {
  id: string;
  name: string;
  description?: string;
  department: Department;
  reportingTo?: string;
  isActive: boolean;
}

/**
 * Employee address information
 */
export interface EmployeeAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: 'permanent' | 'temporary';
}

/**
 * Employee contact information
 */
export interface EmployeeContact {
  primaryPhone: string;
  secondaryPhone?: string;
  personalEmail: string;
  companyEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
}

/**
 * Employee basic information
 */
export interface Employee {
  id: string;
  employeeId: string; // Unique employee identifier (e.g., EMP001)
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  profilePhoto?: string; // High-res profile photo
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  nationality?: string;
  passportNumber?: string;
  department: Department | string;
  designation: Designation | string;
  reportingManager?: Employee | string;
  employmentType: EmploymentType;
  employmentStatus: EmployeeStatus;
  workLocation: WorkLocationType;
  shift: ShiftType;
  dateOfJoining: Date;
  dateOfResignation?: Date;
  contract?: {
    endDate: Date;
    terms: string;
  };
  salary: number;
  salaryGrade?: string;
  address: EmployeeAddress | string;
  contact?: EmployeeContact;
  phone?: string;
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  documents?: EmployeeDocument[];
  performanceRecords?: PerformanceRecord[];
  auditLogs?: AuditLog[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Employee list view (lightweight)
 */
export interface EmployeeListItem {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  department: string;
  avatar?: string;
  profilePhoto?: string;
  isActive: boolean;
  employmentStatus: EmployeeStatus;
  workLocation: WorkLocationType;
  employmentType: EmploymentType;
  reportingManager?: string;
  phone?: string;
  salary?: number;
  address?: string;
  dateOfJoining?: Date;
}

export interface EmployeeImportPreview {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  salary: number;
  dateOfBirth?: string | null;
  employmentType?: EmploymentType;
  employmentStatus?: EmployeeStatus;
  workLocation?: WorkLocationType;
  shift?: ShiftType;
  dateOfJoining?: string;
}
