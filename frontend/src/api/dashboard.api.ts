import api from "@/api/axios";
import type {
  CategoryBreakdown,
  DashboardSummary,
  TrendPoint,
  ApiEnvelope,
} from "@/types";

export async function getSummary(): Promise<DashboardSummary> {
  const response = await api.get<ApiEnvelope<DashboardSummary>>(
    "/analytics/summary",
  );
  return response.data.data;
}

export async function getTrends(): Promise<TrendPoint[]> {
  const response = await api.get<ApiEnvelope<TrendPoint[]>>(
    "/analytics/trends",
  );
  return response.data.data;
}

export async function getByCategory(): Promise<CategoryBreakdown[]> {
  const response = await api.get<ApiEnvelope<CategoryBreakdown[]>>(
    "/analytics/categories",
  );
  return response.data.data;
}
