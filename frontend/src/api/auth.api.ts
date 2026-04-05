import api from "@/api/axios";
import type { User } from "@/types";

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface AuthEnvelope {
  status: string;
  message: string;
  data: LoginResponse;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await api.post<AuthEnvelope>("/auth/login", {
    email,
    password,
  });
  return response.data.data;
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const response = await api.post<AuthEnvelope>("/auth/register", payload);
  return response.data.data;
}
