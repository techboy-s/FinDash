export type Role = "VIEWER" | "ANALYST" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface FinanceRecord {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  recordCount: number;
}

export interface TrendPoint {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  count: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface RecordFilters {
  type?: "INCOME" | "EXPENSE";
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ApiEnvelope<T> {
  status: "success" | "error";
  message?: string;
  data: T;
}

export interface ApiValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  status: "error";
  statusCode: number;
  message: string;
  errors?: ApiValidationError[];
}
