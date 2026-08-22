// Standardized Error Class
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Standardized Success Response Class
export class ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  pagination?: any;

  constructor(statusCode: number, message: string, data: T | null = null, pagination?: any) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (pagination) {
      this.pagination = pagination;
    }
  }
}