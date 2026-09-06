/**
 * Centralized API client for communicating with the RakshaNet backend.
 * 
 * This module provides a unified interface for making HTTP requests to the backend API.
 * It handles:
 * - Base URL configuration via environment variables
 * - JSON serialization/deserialization
 * - Error handling and reporting
 * - Standard HTTP methods (GET, POST, PATCH, DELETE)
 * 
 * Usage:
 *   const users = await apiClient.get('/api/v1/users');
 *   const user = await apiClient.post('/api/v1/users', { name: 'John' });
 *   const updated = await apiClient.patch('/api/v1/users/123', { name: 'Jane' });
 *   await apiClient.delete('/api/v1/users/123');
 */

/**
 * Error details returned from FastAPI validation errors or API errors.
 */
export interface ApiErrorResponse {
  detail?: string | object;
  [key: string]: unknown;
}

/**
 * Thrown when an API request fails.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public endpoint: string,
    public errorData: ApiErrorResponse | null,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Configuration for API client requests.
 */
interface RequestOptions {
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Get the base URL for API requests.
 * Uses NEXT_PUBLIC_API_BASE_URL environment variable, defaults to localhost:8000.
 */
function getApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Default to localhost:8000 for development
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  // Client-side
  return 'http://localhost:8000';
}

/**
 * Make an HTTP request to the API.
 * 
 * @param method - HTTP method (GET, POST, PATCH, DELETE)
 * @param path - API endpoint path (e.g., '/api/v1/users')
 * @param options - Request options (headers, body, signal)
 * @returns Parsed JSON response
 * @throws ApiError if the request fails or returns non-2xx status
 */
async function request<T = unknown>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    ...options.headers,
  };

  const config: RequestInit = {
    method,
    headers,
    signal: options.signal,
  };

  if (options.body !== undefined) {
    if (options.body instanceof URLSearchParams) {
      config.body = options.body.toString();
      headers['Content-Type'] = headers['Content-Type'] || 'application/x-www-form-urlencoded;charset=UTF-8';
    } else if (options.body instanceof FormData) {
      config.body = options.body;
      delete headers['Content-Type'];
    } else {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      config.body = JSON.stringify(options.body);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new ApiError(
      0,
      path,
      null,
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  // Try to parse error response
  let errorData: ApiErrorResponse | null = null;
  if (!response.ok) {
    try {
      errorData = await response.json();
    } catch {
      // Response is not JSON, that's okay
    }
  }

  if (!response.ok) {
    const detail = errorData?.detail;
    const detailMsg =
      typeof detail === 'string'
        ? detail
        : typeof detail === 'object'
          ? JSON.stringify(detail)
          : 'Unknown error';
    throw new ApiError(
      response.status,
      path,
      errorData,
      `API error ${response.status}: ${detailMsg}`,
    );
  }

  // Parse successful response
  try {
    const data = await response.json();
    return data as T;
  } catch {
    // If response is not JSON, return null as the response body
    return null as T;
  }
}

/**
 * Public API client interface.
 * Provides methods for making HTTP requests to the backend.
 */
export const apiClient = {
  /**
   * Make a GET request.
   */
  get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>('GET', path, options);
  },

  /**
   * Make a POST request.
   */
  post<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'body'>,
  ): Promise<T> {
    return request<T>('POST', path, { ...options, body });
  },

  /**
   * Make a PATCH request.
   */
  patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'body'>,
  ): Promise<T> {
    return request<T>('PATCH', path, { ...options, body });
  },

  /**
   * Make a DELETE request.
   */
  delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>('DELETE', path, options);
  },

  /**
   * Get the current API base URL.
   * Useful for debugging or constructing full URLs.
   */
  getBaseUrl(): string {
    return getApiBaseUrl();
  },
};
