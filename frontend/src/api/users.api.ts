// NOTE: The backend does NOT have /api/users endpoints.
// These functions are kept as stubs for future implementation.
// The Users page will show "Feature not available" in the meantime.

import type { Role, User } from "@/types";

export interface GetUsersParams {
  status?: string;
}

export async function getUsers(_params?: GetUsersParams): Promise<User[]> {
  throw new Error("User management API is not yet available on the server.");
}

export async function getUser(_id: string): Promise<User> {
  throw new Error("User management API is not yet available on the server.");
}

export async function updateRole(_id: string, _role: Role): Promise<User> {
  throw new Error("User management API is not yet available on the server.");
}

export async function updateStatus(
  _id: string,
  _status: string,
): Promise<User> {
  throw new Error("User management API is not yet available on the server.");
}
