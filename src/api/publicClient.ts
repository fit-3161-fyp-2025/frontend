import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { API_BASE_URL } from "./client";

class PublicApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 20000,
      // No withCredentials for public endpoints
    });
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
}

export const publicApiClient = new PublicApiClient(API_BASE_URL);
