import { useState, useMemo } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/RoleGuard";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Records from "@/pages/Records";
import Users from "@/pages/Users";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/records": "Records",
  "/users": "Users",
};

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = useMemo(() => {
    return PAGE_TITLES[location.pathname] ?? "Finance Dashboard";
  }, [location.pathname]);

  // Public route: Login
  if (location.pathname === "/login") {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          title={pageTitle}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Routes>
            {/* Root redirect */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            {/* Dashboard — ALL ROLES */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleGuard
                    allowedRoles={["VIEWER", "ANALYST", "ADMIN"]}
                    fallback={<Navigate to="/records" replace />}
                  >
                    <Dashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Records — ALL ROLES */}
            <Route
              path="/records"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={["VIEWER", "ANALYST", "ADMIN"]}>
                    <Records />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Users — ADMIN only */}
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={["ADMIN"]}>
                    <Users />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login is rendered outside the layout */}
          <Route path="/login" element={<Login />} />

          {/* All other routes go through the layout */}
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
