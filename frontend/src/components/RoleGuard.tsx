import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";
import type { Role } from "@/types";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

function DefaultAccessDenied() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4">
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
        You do not have permission to access this page. Contact your
        administrator if you believe this is an error.
      </p>
    </div>
  );
}

export default function RoleGuard({
  allowedRoles,
  children,
  fallback,
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback ?? <DefaultAccessDenied />}</>;
  }

  return <>{children}</>;
}
