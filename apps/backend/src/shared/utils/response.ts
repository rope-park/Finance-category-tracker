export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export const createSuccessResponse = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

export const createErrorResponse = (message: string, error?: string): ApiResponse => ({
  success: false,
  message,
  error,
  timestamp: new Date().toISOString()
});
