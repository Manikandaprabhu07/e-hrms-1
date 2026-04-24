/**
 * Common response wrapper for API responses
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp?: Date;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
  filters?: Record<string, string | number | boolean>;
}

/**
 * Application error structure
 */
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

/**
 * User permissions model
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

/**
 * User role model
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
}
