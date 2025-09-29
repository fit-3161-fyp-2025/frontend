import type { UserDetails } from "./projects";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    passwordConfirm: string,
    name: string,
    lastname: string
  ) => Promise<void>;
  verifyEmailAndLogin: (
    email: string,
    password: string,
    code: string
  ) => Promise<void>;
}

export interface TokenPayload {
  access_token: string;
  refresh_token: string;
  access_expires_at: number;
  refresh_expires_at: number;
  token_type: string;
}

export interface AuthResponse {
  user: User | null;
  token: TokenPayload;
}

export interface UserResponse {
  user: UserDetails;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  send_email?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ValidateTokenRes {
  is_valid: boolean;
}

export interface RefreshTokenPayload {
  token: string;
}

export interface EmailVerifyPayload {
  email: string;
  verification_code: string;
}
