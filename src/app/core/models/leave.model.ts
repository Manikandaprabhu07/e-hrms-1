/**
 * Leave type enum
 */
export enum LeaveType {
  CASUAL = 'casual',
  SICK = 'sick',
  ANNUAL = 'annual',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  BEREAVEMENT = 'bereavement',
  UNPAID = 'unpaid',
  COMPENSATORY = 'compensatory'
}

/**
 * Leave request status enum
 */
export enum LeaveRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  WITHDRAWN = 'withdrawn'
}

/**
 * Leave type policy configuration
 */
export interface LeaveTypePolicy {
  id: string;
  leaveType: LeaveType;
  maxDaysPerYear: number;
  minDaysPerRequest: number;
  maxDaysPerRequest: number;
  carryForwardLimit: number;
  requiresApproval: boolean;
  requiresMedicalCertificate: boolean;
  isActive: boolean;
  description?: string;
}

/**
 * Employee leave balance
 */
export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  year: number;
  totalDaysAllotted: number;
  daysUsed: number;
  daysCarriedForward: number;
  daysAvailable: number;
  lastUpdated: Date;
}

/**
 * Leave request model
 */
export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  partialDay?: {
    type: 'first_half' | 'second_half';
  };
  reason: string;
  status: LeaveRequestStatus;
  requestedDate: Date;
  approvedBy?: string;
  approvalDate?: Date;
  remarks?: string;
  attachments?: string[]; // URLs or file paths
  isWithPay: boolean;
}

/**
 * Leave approval workflow
 */
export interface LeaveApprovalWorkflow {
  id: string;
  leaveType: LeaveType;
  approvalLevels: Array<{
    level: number;
    designation: string;
    approversCount: number;
  }>;
  isActive: boolean;
}
