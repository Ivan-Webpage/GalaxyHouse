/**
 * API 響應泛型類型
 */
export interface ApiResponse<T> {
  body?: T;
  headers?: any;
  status?: number;
  statusText?: string;
}

/**
 * 分頁響應類型
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * API 錯誤響應
 */
export interface ApiError {
  error: {
    [key: string]: any;
  };
  status: number;
  statusText: string;
}
