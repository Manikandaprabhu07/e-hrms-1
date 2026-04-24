import { Role } from './common.model';

/**
 * User authentication model
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: Date;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response with authentication token
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * User registration request
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Change email request
 */
export interface ChangeEmailRequest {
  newEmail: string;
  password: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
}
