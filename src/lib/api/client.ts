import { getCurrentUserToken } from "@/lib/auth/utils";
import { ApiResponse } from "./responses";

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientOptions {
  authenticated?: boolean;
  headers?: Record<string, string>;
}

const DEFAULT_OPTIONS: ApiClientOptions = {
  authenticated: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Standardized API client for making calls to the backend
 */
export const apiClient = {
  /**
   * Make a GET request
   */
  async get<T>(
    endpoint: string, 
    options: ApiClientOptions = DEFAULT_OPTIONS
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  },

  /**
   * Make a POST request
   */
  async post<T>(
    endpoint: string, 
    data?: unknown, 
    options: ApiClientOptions = DEFAULT_OPTIONS
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, options);
  },

  /**
   * Make a PUT request
   */
  async put<T>(
    endpoint: string, 
    data?: unknown, 
    options: ApiClientOptions = DEFAULT_OPTIONS
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, options);
  },

  /**
   * Make a PATCH request
   */
  async patch<T>(
    endpoint: string, 
    data?: unknown, 
    options: ApiClientOptions = DEFAULT_OPTIONS
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', data, options);
  },

  /**
   * Make a DELETE request
   */
  async delete<T>(
    endpoint: string, 
    options: ApiClientOptions = DEFAULT_OPTIONS
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  },

  /**
   * Generic request method
   */
  async request<T>(
    endpoint: string, 
    method: HttpMethod, 
    data?: unknown, 
    options: ApiClientOptions = DEFAULT_OPTIONS
  ): Promise<ApiResponse<T>> {
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      const headers = new Headers(mergedOptions.headers);

      // Add authentication if needed
      if (mergedOptions.authenticated) {
        const token = await getCurrentUserToken();
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        } else {
          return { success: false, error: "Authentication required" };
        }
      }

      // Build request
      const requestOptions: RequestInit = {
        method,
        headers,
      };
      
      // Add body if data is provided
      if (data) {
        requestOptions.body = JSON.stringify(data);
      }

      // Make request
      const response = await fetch(endpoint, requestOptions);
      
      // Check for network errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return { 
          success: false, 
          error: errorData?.error ?? `Request failed with status ${response.status}` 
        };
      }
      
      // Parse response
      const result = await response.json();
      
      // If the API returns { success, error, data } format
      if (typeof result.success === 'boolean') {
        return result as ApiResponse<T>;
      }
      
      // If the API returns data directly
      return { success: true, data: result as T };
    } catch (error) {
      console.error('API request error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  }
}; 