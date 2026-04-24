import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services';
import { ErrorHandlingService } from '../services';
import { NotificationService } from '../services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private errorHandlingService = inject(ErrorHandlingService);
  private notificationService = inject(NotificationService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error, request);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse, request: HttpRequest<any>): void {
    const isAuthRequest =
      request.url.includes('/api/auth/login') ||
      request.url.includes('/api/auth/register');

    switch (error.status) {
      case 401:
        // Unauthorized - token expired or invalid
        if (isAuthRequest) {
          const message = error.error?.message || 'Invalid credentials.';
          this.notificationService.error(message);
          break;
        }
        this.authService.logout();
        this.notificationService.error('Your session has expired. Please login again.');
        break;

      case 403:
        // Forbidden - user lacks permission
        this.notificationService.error('You do not have permission to access this resource.');
        break;

      case 404:
        this.notificationService.error('Resource not found.');
        break;

      case 500:
        this.notificationService.error('Server error. Please try again later.');
        break;

      case 0:
        // Network error
        this.notificationService.error('Network error. Please check your connection.');
        break;

      default:
        const message = error.error?.message || 'An error occurred';
        this.notificationService.error(message);
        break;
    }

    // Log error for monitoring
    this.errorHandlingService.logError({
      code: `HTTP_${error.status}`,
      message: error.message,
      details: error,
      timestamp: new Date()
    });
  }
}
