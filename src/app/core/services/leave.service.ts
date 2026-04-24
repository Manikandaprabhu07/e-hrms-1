import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaveRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private http = inject(HttpClient);
  private apiUrl = '/api/leave';

  private leaveRequestsSignal = signal<LeaveRequest[]>([]);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  leaveRequests = this.leaveRequestsSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  getAll(): Promise<LeaveRequest[]> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.get<LeaveRequest[]>(`${this.apiUrl}`).subscribe({
        next: (response) => {
          this.isLoadingSignal.set(false);
          this.leaveRequestsSignal.set(response);
          resolve(response);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load leave requests');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  getMy(): Promise<LeaveRequest[]> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.get<LeaveRequest[]>(`${this.apiUrl}/my`).subscribe({
        next: (requests) => {
          this.isLoadingSignal.set(false);
          this.leaveRequestsSignal.set(requests);
          resolve(requests);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load leave requests');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  requestLeave(request: Partial<LeaveRequest>): Promise<LeaveRequest> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.post<LeaveRequest>(`${this.apiUrl}`, request).subscribe({
        next: (created) => {
          this.isLoadingSignal.set(false);
          this.leaveRequestsSignal.update(requests => [...requests, created]);
          resolve(created);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to request leave');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  approveLeaveRequest(leaveRequestId: string): Promise<LeaveRequest> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.patch<LeaveRequest>(
        `${this.apiUrl}/${leaveRequestId}`,
        { status: 'Approved' }
      ).subscribe({
        next: (updated) => {
          this.isLoadingSignal.set(false);
          resolve(updated);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to approve leave request');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  rejectLeaveRequest(leaveRequestId: string): Promise<LeaveRequest> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.patch<LeaveRequest>(
        `${this.apiUrl}/${leaveRequestId}`,
        { status: 'Rejected' }
      ).subscribe({
        next: (updated) => {
          this.isLoadingSignal.set(false);
          resolve(updated);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to reject leave request');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }
}
