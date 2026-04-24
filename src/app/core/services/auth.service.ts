import { Injectable, inject, signal, computed, effect, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthState, LoginRequest, LoginResponse, User, RegisterRequest, ChangePasswordRequest, ChangeEmailRequest } from '../models';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = '/api/auth';

  // State signals
  private authStateSignal = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    accessToken: null
  });

  // Public read-only signals
  authState = this.authStateSignal.asReadonly();
  user = computed(() => this.authStateSignal().user);
  isAuthenticated = computed(() => this.authStateSignal().isAuthenticated);
  isLoading = computed(() => this.authStateSignal().isLoading);
  error = computed(() => this.authStateSignal().error);
  accessToken = computed(() => this.authStateSignal().accessToken);

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from stored token
   */
  private initializeAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (token && user) {
      this.authStateSignal.update(state => ({
        ...state,
        accessToken: token,
        user: JSON.parse(user),
        isAuthenticated: true
      }));
    }
  }

  /**
   * User login
   */
  login(request: LoginRequest): Promise<LoginResponse> {
    this.authStateSignal.update(state => ({ ...state, isLoading: true, error: null }));

    return new Promise((resolve, reject) => {
      this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).subscribe({
        next: (response) => {
          this.setAuthState(response);
          resolve(response);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Login failed';
          this.authStateSignal.update(state => ({
            ...state,
            isLoading: false,
            error: errorMessage
          }));
          reject(error);
        }
      });
    });
  }

  /**
   * User registration
   */
  register(request: RegisterRequest): Promise<User> {
    this.authStateSignal.update(state => ({ ...state, isLoading: true, error: null }));

    return new Promise((resolve, reject) => {
      this.http.post<User>(`${this.apiUrl}/register`, request).subscribe({
        next: (user) => {
          this.authStateSignal.update(state => ({
            ...state,
            isLoading: false
          }));
          resolve(user);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Registration failed';
          this.authStateSignal.update(state => ({
            ...state,
            isLoading: false,
            error: errorMessage
          }));
          reject(error);
        }
      });
    });
  }

  /**
   * User logout
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');

    this.authStateSignal.set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null
    });

    this.router.navigate(['/login']);
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return Promise.reject('No refresh token available');
    }

    return new Promise((resolve, reject) => {
      this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken }).subscribe({
        next: (response) => {
          this.setAuthState(response);
          resolve(response);
        },
        error: (error) => {
          this.logout();
          reject(error);
        }
      });
    });
  }

  /**
   * Set authentication state after successful login
   */
  private setAuthState(response: LoginResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));

    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    this.authStateSignal.set({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      accessToken: response.accessToken
    });
  }

  /**
   * Check if user has specific role
   */
  hasRole(roleName: string): boolean {
    const currentUser = this.user();
    return currentUser?.roles?.some(role => role.name === roleName) ?? false;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permissionName: string): boolean {
    const currentUser = this.user();
    return currentUser?.roles?.some(role =>
      role.permissions?.some(permission => permission.name === permissionName)
    ) ?? false;
  }

  /**
   * Change user password
   */
  changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
    this.authStateSignal.update(state => ({ ...state, isLoading: true, error: null }));

    return new Promise((resolve, reject) => {
      this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, request).subscribe({
        next: (response) => {
          this.authStateSignal.update(state => ({
            ...state,
            isLoading: false
          }));
          resolve(response);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to change password';
          this.authStateSignal.update(state => ({
            ...state,
            isLoading: false,
            error: errorMessage
          }));
          reject(error);
        }
      });
    });
  }

  /**
   * Change user email
   */
  changeEmail(request: ChangeEmailRequest): Promise<{ message: string; user: User }> {
    this.authStateSignal.update(state => ({ ...state, isLoading: true, error: null }));

    return new Promise((resolve, reject) => {
      this.http.post<{ message: string; user: User }>(`${this.apiUrl}/change-email`, request).subscribe({
        next: (response) => {
          // Update stored user with new email
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.authStateSignal.update(state => ({
              ...state,
              user: response.user,
              isLoading: false
            }));
          }
          resolve(response);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to change email';
          this.authStateSignal.update(state => ({
            ...state,
            isLoading: false,
            error: errorMessage
          }));
          reject(error);
        }
      });
    });
  }
}
