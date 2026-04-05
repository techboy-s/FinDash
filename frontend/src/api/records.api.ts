import api from "@/api/axios";
import type {
  FinanceRecord,
  PaginatedResponse,
  RecordFilters,
} from "@/types";

export interface CreateRecordPayload {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
  notes?: string | null;
}

export interface UpdateRecordPayload {
  amount?: number;
  type?: "INCOME" | "EXPENSE";
  category?: string;
  date?: string;
  notes?: string | null;
}

// Backend getRecords response shape: { status, data: [...], meta: {...} }
interface GetRecordsEnvelope {
  status: string;
  data: FinanceRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface SingleRecordEnvelope {
  status: string;
  data: FinanceRecord;
}

export async function getRecords(
  params: RecordFilters,
): Promise<PaginatedResponse<FinanceRecord>> {
  const response = await api.get<GetRecordsEnvelope>("/records", { params });
  return {
    data: response.data.data,
    meta: response.data.meta,
  };
}

export async function getRecord(id: string): Promise<FinanceRecord> {
  const response = await api.get<SingleRecordEnvelope>(`/records/${id}`);
  return response.data.data;
}

export async function createRecord(
  data: CreateRecordPayload,
): Promise<FinanceRecord> {
  const response = await api.post<SingleRecordEnvelope>("/records", data);
  return response.data.data;
}

export async function updateRecord(
  id: string,
  data: UpdateRecordPayload,
): Promise<FinanceRecord> {
  // Backend uses PUT, not PATCH
  const response = await api.put<SingleRecordEnvelope>(`/records/${id}`, data);
  return response.data.data;
}

export async function deleteRecord(id: string): Promise<void> {
  await api.delete(`/records/${id}`);
}
