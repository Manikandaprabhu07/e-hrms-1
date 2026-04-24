import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'work_from_home'
  | 'on_leave'
  | 'holiday'
  | 'weekend';

export interface ApiEmployeeRef {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface ApiAttendance {
  id: string;
  employee: ApiEmployeeRef;
  date: string; // YYYY-MM-DD
  clockIn: string | null;
  clockOut: string | null;
  status: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = '/api/attendance';

  private attendanceRecordsSignal = signal<ApiAttendance[]>([]);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  attendanceRecords = this.attendanceRecordsSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  getAll(): Promise<ApiAttendance[]> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.get<ApiAttendance[]>(`${this.apiUrl}`).subscribe({
        next: (records) => {
          this.isLoadingSignal.set(false);
          this.attendanceRecordsSignal.set(records || []);
          resolve(records || []);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load attendance records');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  getForEmployee(employeeId: string): Promise<ApiAttendance[]> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.get<ApiAttendance[]>(`${this.apiUrl}/employee/${employeeId}`).subscribe({
        next: (records) => {
          this.isLoadingSignal.set(false);
          this.attendanceRecordsSignal.set(records || []);
          resolve(records || []);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load attendance records');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  getMine(): Promise<ApiAttendance[]> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.get<ApiAttendance[]>(`${this.apiUrl}/my`).subscribe({
        next: (records) => {
          this.isLoadingSignal.set(false);
          this.attendanceRecordsSignal.set(records || []);
          resolve(records || []);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load attendance records');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  markAttendance(record: { employeeId: string; date: string; status: AttendanceStatus; clockIn?: string | null; clockOut?: string | null }): Promise<ApiAttendance> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.post<ApiAttendance>(`${this.apiUrl}`, record).subscribe({
        next: (created) => {
          this.isLoadingSignal.set(false);
          resolve(created);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to mark attendance');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }
}
