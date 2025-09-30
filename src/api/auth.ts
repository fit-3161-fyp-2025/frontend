import type {
  AuthResponse,
  EmailVerifyPayload,
  RefreshTokenPayload,
  RegisterPayload,
  User,
  UserResponse,
} from "@/types/auth";
import { apiClient } from "./client";

export const authApi = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/users/register",
      data
    );
    return response.data;
  },

  getUserById: async (user_id: string): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(
      `users/get-user-by-id/${user_id}`
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<UserResponse>(
      `/users/get-current-user`
    );
    return response.data.user;
  },

  verifyCode: async (data: EmailVerifyPayload): Promise<User> => {
    const response = await apiClient.post<User>("/users/verify-code", data);
    return response.data;
  },

  login: async (data: FormData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/set-token",
      data
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  refreshToken: async (data: RefreshTokenPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/refresh-token",
      data
    );
    return response.data;
  },

  refresh: async (): Promise<void> => {
    await apiClient.post("/auth/refresh-token");
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },
};
