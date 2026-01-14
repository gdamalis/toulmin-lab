/**
 * Client-side API helper with auth token management
 * 
 * Provides a typed, consistent interface for making API requests from client components.
 */

import { getCurrentUserToken } from './auth/utils';
import { ApiResponse } from './api/responses';

/**
 * API client error
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Typed API client for making authenticated requests
 * 
 * @example
 * const result = await apiClient.get<{ user: User }>('/api/users/me');
 * if (result.success) {
 *   console.log(result.data.user);
 * }
 */
class APIClient {
  /**
   * Make a GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Internal request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      // Get auth token
      const token = await getCurrentUserToken();
      if (!token) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // Make request
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      // Parse response
      const data = await response.json();

      // Check for errors
      if (!response.ok) {
        return {
          success: false,
          error: data.error ?? `Request failed with status ${response.status}`,
        };
      }

      // Return success response
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new APIClient();
