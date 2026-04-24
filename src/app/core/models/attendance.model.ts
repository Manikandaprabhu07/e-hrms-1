/**
 * Attendance status enum
 */
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  WORK_FROM_HOME = 'work_from_home',
  ON_LEAVE = 'on_leave',
  HOLIDAY = 'holiday',
  WEEKEND = 'weekend'
}

/**
 * Daily attendance record
 */
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  workingHours?: number;
  remarks?: string;
  markedBy?: string;
  markedDate?: Date;
}

/**
 * Employee shift configuration
 */
export interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  breakDuration: number; // in minutes
  workingDays: number[]; // 0-6, 0=Sunday
  isDefault: boolean;
}

/**
 * Employee shift assignment
 */
export interface EmployeeShift {
  id: string;
  employeeId: string;
  shift: Shift;
  effectiveDate: Date;
  endDate?: Date;
  isActive: boolean;
}

/**
 * Biometric device model
 */
export interface BiometricDevice {
  id: string;
  deviceName: string;
  location: string;
  ipAddress: string;
  isActive: boolean;
}

/**
 * Attendance summary for a period
 */
export interface AttendanceSummary {
  employeeId: string;
  periodStart: Date;
  periodEnd: Date;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  workFromHomeDays: number;
  leaveDays: number;
  attendancePercentage: number;
}
