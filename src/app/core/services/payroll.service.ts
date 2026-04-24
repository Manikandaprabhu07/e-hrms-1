import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PayrollSlip, EmployeeSalaryStructure, PaginationParams, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private http = inject(HttpClient);
  private apiUrl = '/api/payroll';

  private payrollSlipsSignal = signal<PayrollSlip[]>([]);
  private salaryStructuresSignal = signal<EmployeeSalaryStructure[]>([]);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  payrollSlips = this.payrollSlipsSignal.asReadonly();
  salaryStructures = this.salaryStructuresSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  getAll(): Promise<any[]> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (records) => {
          this.isLoadingSignal.set(false);
          resolve(records || []);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load payroll records');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  getMine(): Promise<any[]> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.get<any[]>(`${this.apiUrl}/my`).subscribe({
        next: (records) => {
          this.isLoadingSignal.set(false);
          resolve(records || []);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load payroll records');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  create(record: any): Promise<any> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.post<any>(this.apiUrl, record).subscribe({
        next: (created) => {
          this.isLoadingSignal.set(false);
          resolve(created);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to create payroll');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  update(id: string, patch: any): Promise<any> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.patch<any>(`${this.apiUrl}/${id}`, patch).subscribe({
        next: (updated) => {
          this.isLoadingSignal.set(false);
          resolve(updated);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to update payroll');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  getPayrollSlips(employeeId: string, params: PaginationParams): Promise<PaginatedResponse<PayrollSlip>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const queryParams = new URLSearchParams();
    queryParams.set('employeeId', employeeId);
    queryParams.set('pageNumber', params.pageNumber.toString());
    queryParams.set('pageSize', params.pageSize.toString());

    return new Promise((resolve, reject) => {
      this.http.get<PaginatedResponse<PayrollSlip>>(
        `${this.apiUrl}/slips?${queryParams.toString()}`
      ).subscribe({
        next: (response) => {
          this.isLoadingSignal.set(false);
          resolve(response);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load payroll slips');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  getEmployeeSalaryStructure(employeeId: string): Promise<EmployeeSalaryStructure> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.get<EmployeeSalaryStructure>(
        `${this.apiUrl}/salary-structure/${employeeId}`
      ).subscribe({
        next: (structure) => {
          this.isLoadingSignal.set(false);
          resolve(structure);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load salary structure');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  updateSalaryStructure(employeeId: string, structure: Partial<EmployeeSalaryStructure>): Promise<EmployeeSalaryStructure> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.put<EmployeeSalaryStructure>(
        `${this.apiUrl}/salary-structure/${employeeId}`,
        structure
      ).subscribe({
        next: (updated) => {
          this.isLoadingSignal.set(false);
          resolve(updated);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to update salary structure');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }
}
