import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUsers, updateRole, deleteUser } from "@/api/users.api";
import type { Role, User } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import axios from "axios";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data: unknown = err.response?.data;
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

export default function Users() {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [roleModalRef, setRoleModalRef] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>("VIEWER");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      void loadUsers();
    }
  }, [currentUser, loadUsers]);

  // Non-ADMIN guard
  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="max-w-sm text-center text-sm text-gray-500">
          You do not have permission to manage users. Contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const confirmDelete = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeletingId(null);
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteUser(deletingId);
      setUsers((prev) => prev.filter((u) => u.id !== deletingId));
      setDeletingId(null);
    } catch (err: unknown) {
      setError(extractApiError(err));
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const openRoleModal = useCallback((targetUser: User) => {
    setRoleModalRef(targetUser);
    setSelectedRole(targetUser.role);
  }, []);

  const closeRoleModal = useCallback(() => {
    setRoleModalRef(null);
  }, []);

  const handleRoleUpdate = async () => {
    if (!roleModalRef) return;
    setIsUpdatingRole(true);
    try {
      await updateRole(roleModalRef.id, selectedRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === roleModalRef.id ? { ...u, role: selectedRole } : u))
      );
      closeRoleModal();
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button variant="ghost" onClick={loadUsers}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <svg className="h-8 w-8 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Role</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{u.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Badge 
                        label={u.role} 
                        variant={u.role === "ADMIN" ? "indigo" : u.role === "ANALYST" ? "green" : "gray"} 
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.id !== currentUser?.id && (
                          <>
                            <button
                              type="button"
                              onClick={() => openRoleModal(u)}
                              className="rounded-md px-2 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                            >
                              Change Role
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete(u.id)}
                              className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50"
                              aria-label="Delete user"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                        {u.id === currentUser?.id && (
                          <span className="text-xs text-gray-400 italic px-2">You</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Update Modal */}
      <Modal isOpen={roleModalRef !== null} onClose={closeRoleModal} title="Change User Role">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select a new role for <span className="font-medium text-gray-900">{roleModalRef?.name}</span>.
          </p>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="VIEWER">Viewer</option>
            <option value="ANALYST">Analyst</option>
            <option value="ADMIN">Admin</option>
          </select>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={closeRoleModal}>Cancel</Button>
            <Button variant="primary" loading={isUpdatingRole} onClick={handleRoleUpdate}>Update</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deletingId !== null} onClose={cancelDelete} title="Delete User">
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this user? This action cannot be undone. All associated records will also be deleted.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={cancelDelete}>Cancel</Button>
          <Button variant="danger" loading={isDeleting} onClick={() => void handleDelete()}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
