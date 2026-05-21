import api from "./axios";
import { LoginRequest, SignupRequest, AuthResponse, RefreshTokenRequest } from "@/types";

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/v1/auth/login", data),
  register: (data: SignupRequest) =>
    api.post<AuthResponse>("/v1/auth/signup", data),
  refresh: (data: RefreshTokenRequest) =>
    api.post<AuthResponse>("/v1/auth/refresh", data),
};