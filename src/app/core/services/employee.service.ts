import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Employee,
  EmployeeImportPreview,
  EmployeeListItem,
  PaginationParams,
  PaginatedResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = '/api/employees';

  // State signals
  private employeesSignal = signal<Employee[]>([]);
  private selectedEmployeeSignal = signal<Employee | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private paginationSignal = signal({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

  // Public read-only signals
  employees = this.employeesSignal.asReadonly();
  selectedEmployee = this.selectedEmployeeSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  pagination = this.paginationSignal.asReadonly();

  // Computed signals
  employeeCount = computed(() => this.employeesSignal().length);
  hasEmployees = computed(() => this.employeeCount() > 0);

  /**
   * Get all employees with pagination and filtering
   */
  getEmployees(params: PaginationParams): Promise<PaginatedResponse<EmployeeListItem>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const queryParams = new URLSearchParams();
    queryParams.set('pageNumber', params.pageNumber.toString());
    queryParams.set('pageSize', params.pageSize.toString());

    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.set('sortDirection', params.sortDirection);
    if (params.searchTerm) queryParams.set('searchTerm', params.searchTerm);
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        queryParams.set(`filters.${key}`, String(value));
      });
    }

    return new Promise((resolve, reject) => {
      this.http.get<any>(
        `${this.apiUrl}?${queryParams.toString()}`
      ).subscribe({
        next: (response) => {
          this.isLoadingSignal.set(false);
          // Handle both API shapes:
          // 1) Employee[] (current backend)
          // 2) { items: Employee[] } or { data: Employee[] } (paginated wrappers)
          const employees = Array.isArray(response)
            ? response
            : (response.items || response.data || []);
          this.employeesSignal.set(employees);
          this.paginationSignal.set({
            pageNumber: response?.pageNumber || 1,
            pageSize: response?.pageSize || params.pageSize,
            totalCount: response?.totalCount || employees.length,
            totalPages: response?.totalPages || Math.max(1, Math.ceil(employees.length / params.pageSize))
          });
          resolve(response);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to load employees';
          this.errorSignal.set(errorMessage);
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }


  /**
   * Get employee by ID
   */
  getEmployeeById(employeeId: string): Promise<Employee> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.get<Employee>(`${this.apiUrl}/${employeeId}`).subscribe({
        next: (employee) => {
          this.isLoadingSignal.set(false);
          this.selectedEmployeeSignal.set(employee);
          resolve(employee);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to load employee';
          this.errorSignal.set(errorMessage);
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  /**
   * Get current logged-in employee profile (EMPLOYEE only)
   */
  getMe(): Promise<Employee> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.get<Employee>(`${this.apiUrl}/me`).subscribe({
        next: (employee) => {
          this.isLoadingSignal.set(false);
          this.selectedEmployeeSignal.set(employee);
          resolve(employee);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to load profile';
          this.errorSignal.set(errorMessage);
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  /**
   * Create new employee
   */
  createEmployee(employee: Partial<Employee>): Promise<Employee> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.post<Employee>(this.apiUrl, employee).subscribe({
        next: (newEmployee) => {
          this.isLoadingSignal.set(false);
          this.employeesSignal.update(employees => [...employees, newEmployee]);
          resolve(newEmployee);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to create employee';
          this.errorSignal.set(errorMessage);
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  /**
   * Update employee information
   */
  updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.patch<Employee>(`${this.apiUrl}/${employeeId}`, updates).subscribe({
        next: (updatedEmployee) => {
          this.isLoadingSignal.set(false);
          this.employeesSignal.update(employees =>
            employees.map(emp => emp.id === employeeId ? updatedEmployee : emp)
          );
          if (this.selectedEmployeeSignal()?.id === employeeId) {
            this.selectedEmployeeSignal.set(updatedEmployee);
          }
          resolve(updatedEmployee);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to update employee';
          this.errorSignal.set(errorMessage);
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  /**
   * Delete employee
   */
  deleteEmployee(employeeId: string): Promise<void> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.delete<void>(`${this.apiUrl}/${employeeId}`).subscribe({
        next: () => {
          this.isLoadingSignal.set(false);
          this.employeesSignal.update(employees =>
            employees.filter(emp => emp.id !== employeeId)
          );
          if (this.selectedEmployeeSignal()?.id === employeeId) {
            this.selectedEmployeeSignal.set(null);
          }
          resolve();
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to delete employee';
          this.errorSignal.set(errorMessage);
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  /**
   * Clear selected employee
   */
  clearSelection(): void {
    this.selectedEmployeeSignal.set(null);
  }

  /**
   * Clear all errors
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  uploadEmployeesPreview(file: File): Promise<EmployeeImportPreview[]> {
    const formData = new FormData();
    formData.append('file', file);

    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.post<EmployeeImportPreview[]>(`${this.apiUrl}/upload-preview`, formData).subscribe({
        next: (rows) => {
          this.isLoadingSignal.set(false);
          resolve(rows);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to preview employees';
          this.errorSignal.set(errorMessage);
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  saveImportedEmployees(rows: EmployeeImportPreview[]): Promise<{ message: string; saved: number; skipped: number }> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.post<{ message: string; saved: number; skipped: number }>(`${this.apiUrl}/save-import`, rows).subscribe({
        next: (response) => {
          this.isLoadingSignal.set(false);
          resolve(response);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to import employees';
          this.errorSignal.set(errorMessage);
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }
}
