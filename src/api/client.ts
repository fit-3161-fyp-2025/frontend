import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

// Extend the Axios request config to include our custom _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
// export const API_BASE_URL = "abc";

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 20000,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Response interceptor to handle token refresh on 401
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          // Don't try to refresh on auth-related requests to avoid infinite loops
          if (
            originalRequest.url?.includes("/auth/me") ||
            originalRequest.url?.includes("/auth/set-token") ||
            originalRequest.url?.includes("/auth/logout") ||
            originalRequest.url?.includes("/auth/refresh-token")
          ) {
            return Promise.reject(error);
          }

          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshToken();
            this.processQueue(null);
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            // Display toast for 401 error before redirect
            if (typeof window !== "undefined") {
              toast.error("Session expired. Please log in again.");
            }
            // Redirect to login or handle auth failure
            window.location.href = "/login";
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Centralized error handling for other HTTP statuses
        if (error.response) {
          const { status, data } = error.response as {
            status: number;
            data: any;
          };
          let errorMessage = "An unexpected error occurred";

          switch (status) {
            case 400:
              errorMessage =
                (data && (data.detail || data.message)) ||
                "Invalid input. Please check your data.";

              if (data && data.errors) {
                errorMessage = data.errors
                  .map((err: any) => `${err.field}: ${err.message}`)
                  .join("\n");
              }

              break;
            case 403:
              errorMessage =
                "You do not have permission to perform this action.";
              break;
            case 404:
              errorMessage = "Resource not found.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage = data.message || errorMessage;
          }

          if (typeof window !== "undefined") {
            toast.error(errorMessage);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    this.failedQueue = [];
  }

  private async refreshToken(): Promise<void> {
    try {
      await this.axiosInstance.post("/auth/refresh-token");
    } catch (error) {
      throw error;
    }
  }

  // Method to manually refresh token (for route changes)
  public async refreshTokenOnRouteChange(): Promise<boolean> {
    try {
      await this.refreshToken();
      return true;
    } catch (error) {
      console.error("Token refresh failed on route change:", error);
      return false;
    }
  }

  private async request<T = unknown>(
    config: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.request<T>(config);
  }

  get<T = unknown>(endpoint: string, config?: AxiosRequestConfig) {
    return this.request<T>({ url: endpoint, method: "GET", ...config });
  }
  post<T = unknown>(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ url: endpoint, method: "POST", data, ...config });
  }
  put<T = unknown>(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ url: endpoint, method: "PUT", data, ...config });
  }
  delete<T = unknown>(endpoint: string, config?: AxiosRequestConfig) {
    return this.request<T>({ url: endpoint, method: "DELETE", ...config });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
