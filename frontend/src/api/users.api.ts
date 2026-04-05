// NOTE: The backend does NOT have /api/users endpoints.
// These functions are kept as stubs for future implementation.
// The Users page will show "Feature not available" in the meantime.

import api from "@/api/axios";
import type { Role, User, ApiEnvelope } from "@/types";

export interface GetUsersParams {
  status?: string;
}

export async function getUsers(_params?: GetUsersParams): Promise<User[]> {
  const response = await api.get<ApiEnvelope<User[]>>("/users");
  return response.data.data;
}

export async function getUser(id: string): Promise<User> {
  const response = await api.get<ApiEnvelope<User>>(`/users/${id}`);
  return response.data.data;
}

export async function updateRole(id: string, role: Role): Promise<User> {
  const response = await api.put<ApiEnvelope<User>>(`/users/${id}/role`, { role });
  return response.data.data;
}

export async function updateStatus(
  id: string,
  _status: string,
): Promise<User> {
  // Not implemented in backend yet, just returning a mock
  return getUser(id);
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
