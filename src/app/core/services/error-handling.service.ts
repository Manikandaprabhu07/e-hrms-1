import { Injectable, signal } from '@angular/core';
import { AppError } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errorsSignal = signal<AppError[]>([]);
  errors = this.errorsSignal.asReadonly();

  /**
   * Log an error to the service
   */
  logError(error: AppError | unknown): AppError {
    let appError: AppError;

    if (this.isAppError(error)) {
      appError = error;
    } else if (error instanceof Error) {
      appError = {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        details: error.stack,
        timestamp: new Date()
      };
    } else {
      appError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        details: error,
        timestamp: new Date()
      };
    }

    this.errorsSignal.update(errors => [...errors, appError]);
    console.error('Application Error:', appError);

    return appError;
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errorsSignal.set([]);
  }

  /**
   * Clear specific error by code
   */
  clearErrorByCode(code: string): void {
    this.errorsSignal.update(errors => errors.filter(e => e.code !== code));
  }

  /**
   * Get last error
   */
  getLastError(): AppError | null {
    const errors = this.errorsSignal();
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }

  /**
   * Type guard for AppError
   */
  private isAppError(error: unknown): error is AppError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      'timestamp' in error
    );
  }
}
