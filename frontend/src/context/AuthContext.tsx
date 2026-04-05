import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { login as loginApi } from "@/api/auth.api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function parseStoredUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "id" in parsed &&
      "name" in parsed &&
      "email" in parsed &&
      "role" in parsed
    ) {
      const obj = parsed as Record<string, unknown>;
      if (
        typeof obj.id === "string" &&
        typeof obj.name === "string" &&
        typeof obj.email === "string" &&
        (obj.role === "VIEWER" || obj.role === "ANALYST" || obj.role === "ADMIN")
      ) {
        return {
          id: obj.id,
          name: obj.name,
          email: obj.email,
          role: obj.role,
        };
      }
    }
  } catch {
    // corrupted JSON — treat as logged out
  }
  return null;
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as Record<string, unknown>).message === "string"
    ) {
      return (data as Record<string, unknown>).message as string;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = parseStoredUser(localStorage.getItem("user"));

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      // Partial / corrupted state — clean up
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setIsLoading(false);
  }, []);

  // Login: call API → persist → navigate
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        const response = await loginApi(email, password);

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        setToken(response.token);
        setUser(response.user);

        navigate("/dashboard");
      } catch (error: unknown) {
        throw new Error(extractErrorMessage(error));
      }
    },
    [navigate],
  );

  // Logout: clear everything → navigate to login
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, login, logout }),
    [user, token, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
