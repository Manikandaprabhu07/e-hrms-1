import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PerformanceAppraisal, TrainingEnrollment, PaginationParams, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private http = inject(HttpClient);
  private apiUrl = '/api/performance';

  private appraisalsSignal = signal<PerformanceAppraisal[]>([]);
  private trainingsSignal = signal<TrainingEnrollment[]>([]);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  appraisals = this.appraisalsSignal.asReadonly();
  trainings = this.trainingsSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  getAppraisals(employeeId: string, params: PaginationParams): Promise<PaginatedResponse<PerformanceAppraisal>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const queryParams = new URLSearchParams();
    queryParams.set('employeeId', employeeId);
    queryParams.set('pageNumber', params.pageNumber.toString());
    queryParams.set('pageSize', params.pageSize.toString());

    return new Promise((resolve, reject) => {
      this.http.get<PaginatedResponse<PerformanceAppraisal>>(
        `${this.apiUrl}/appraisals?${queryParams.toString()}`
      ).subscribe({
        next: (response) => {
          this.isLoadingSignal.set(false);
          resolve(response);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load appraisals');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  getAppraisalById(appraisalId: string): Promise<PerformanceAppraisal> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.get<PerformanceAppraisal>(
        `${this.apiUrl}/appraisals/${appraisalId}`
      ).subscribe({
        next: (appraisal) => {
          this.isLoadingSignal.set(false);
          resolve(appraisal);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load appraisal');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  createAppraisal(appraisal: Partial<PerformanceAppraisal>): Promise<PerformanceAppraisal> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve, reject) => {
      this.http.post<PerformanceAppraisal>(`${this.apiUrl}/appraisals`, appraisal).subscribe({
        next: (created) => {
          this.isLoadingSignal.set(false);
          this.appraisalsSignal.update(appraisals => [...appraisals, created]);
          resolve(created);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to create appraisal');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }

  getTrainings(employeeId: string, params: PaginationParams): Promise<PaginatedResponse<TrainingEnrollment>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const queryParams = new URLSearchParams();
    queryParams.set('employeeId', employeeId);
    queryParams.set('pageNumber', params.pageNumber.toString());
    queryParams.set('pageSize', params.pageSize.toString());

    return new Promise((resolve, reject) => {
      this.http.get<PaginatedResponse<TrainingEnrollment>>(
        `${this.apiUrl}/trainings?${queryParams.toString()}`
      ).subscribe({
        next: (response) => {
          this.isLoadingSignal.set(false);
          resolve(response);
        },
        error: (error) => {
          this.errorSignal.set(error.error?.message || 'Failed to load trainings');
          this.isLoadingSignal.set(false);
          reject(error);
        }
      });
    });
  }
}
