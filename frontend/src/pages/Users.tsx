import { useAuth } from "@/context/AuthContext";

export default function Users() {
  const { user } = useAuth();

  // Non-ADMIN guard
  if (user?.role !== "ADMIN") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="max-w-sm text-center text-sm text-gray-500">
          You do not have permission to manage users. Contact your administrator
          if you believe this is an error.
        </p>
      </div>
    );
  }

  // Admin view — feature not yet available on backend
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
        <svg
          className="h-8 w-8 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">
        User Management
      </h2>
      <p className="max-w-sm text-center text-sm text-gray-500">
        User management features are coming soon. The backend API for this
        module is currently under development.
      </p>
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">Note:</span> The server does not yet
          have <code className="rounded bg-yellow-100 px-1 text-xs">/api/users</code> endpoints.
          This page will become functional once the backend implements user
          management routes.
        </p>
      </div>
    </div>
  );
}
