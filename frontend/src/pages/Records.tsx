import { useEffect, useState, useCallback } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from "@/api/records.api";
import type {
  CreateRecordPayload,
  UpdateRecordPayload,
} from "@/api/records.api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type {
  FinanceRecord,
  PaginationMeta,
  RecordFilters,
} from "@/types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toDateInputValue(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Convert YYYY-MM-DD to ISO 8601 datetime string for the backend */
function toISODatetime(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data: unknown = err.response?.data;
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as Record<string, unknown>).message === "string"
    ) {
      return (data as Record<string, unknown>).message as string;
    }
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

/**
 * Backend returns validation errors as:
 * { status: "error", statusCode: 400, message: "Validation failed",
 *   errors: [{ field: "amount", message: "..." }, ...] }
 * Convert the array into a Record<string, string> for field-level display.
 */
function extractFieldErrors(err: unknown): Record<string, string> {
  if (axios.isAxiosError(err) && err.response?.status === 400) {
    const data: unknown = err.response.data;
    if (
      typeof data === "object" &&
      data !== null &&
      "errors" in data &&
      Array.isArray((data as Record<string, unknown>).errors)
    ) {
      const errArray = (data as Record<string, unknown>).errors as unknown[];
      const result: Record<string, string> = {};
      for (const item of errArray) {
        if (
          typeof item === "object" &&
          item !== null &&
          "field" in item &&
          "message" in item &&
          typeof (item as Record<string, unknown>).field === "string" &&
          typeof (item as Record<string, unknown>).message === "string"
        ) {
          const fieldName = (item as Record<string, unknown>).field as string;
          const fieldMsg = (item as Record<string, unknown>).message as string;
          result[fieldName] = fieldMsg;
        }
      }
      return result;
    }
  }
  return {};
}

const DEFAULT_LIMIT = 20;

interface RecordFormState {
  amount: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
  notes: string;
}

const EMPTY_FORM: RecordFormState = {
  amount: "",
  type: "INCOME",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

interface FormErrors {
  amount?: string;
  type?: string;
  category?: string;
  date?: string;
}

function validateForm(form: RecordFormState): FormErrors {
  const errors: FormErrors = {};
  const amt = Number(form.amount);

  if (!form.amount.trim()) {
    errors.amount = "Amount is required";
  } else if (isNaN(amt) || amt <= 0) {
    errors.amount = "Amount must be a positive number";
  }

  if (!form.category.trim()) {
    errors.category = "Category is required";
  }

  if (!form.date) {
    errors.date = "Date is required";
  }

  return errors;
}

export default function Records() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // Data
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterType, setFilterType] = useState<"" | "INCOME" | "EXPENSE">("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(
    null,
  );
  const [form, setForm] = useState<RecordFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formApiError, setFormApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch records ────────────────────────────────────────────────────────
  const fetchRecords = useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      setError("");

      try {
        const params: RecordFilters = {
          page,
          limit: DEFAULT_LIMIT,
        };
        if (filterType) params.type = filterType;
        if (filterCategory.trim()) params.category = filterCategory.trim();
        // Backend expects ISO 8601 datetime strings for startDate/endDate
        if (filterFrom) params.startDate = toISODatetime(filterFrom);
        if (filterTo) params.endDate = toISODatetime(filterTo);

        const result = await getRecords(params);
        setRecords(result.data);
        setMeta(result.meta);
      } catch (err: unknown) {
        setError(extractApiError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [filterType, filterCategory, filterFrom, filterTo],
  );

  useEffect(() => {
    void fetchRecords(currentPage);
  }, [fetchRecords, currentPage]);

  // ── Filter handlers ──────────────────────────────────────────────────────
  function handleApplyFilters() {
    setCurrentPage(1);
    void fetchRecords(1);
  }

  function handleResetFilters() {
    setFilterType("");
    setFilterCategory("");
    setFilterFrom("");
    setFilterTo("");
    setCurrentPage(1);
  }

  // ── Modal handlers ───────────────────────────────────────────────────────
  function openAddModal() {
    setEditingRecord(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormApiError("");
    setIsModalOpen(true);
  }

  function openEditModal(record: FinanceRecord) {
    setEditingRecord(record);
    setForm({
      amount: String(record.amount / 100),
      type: record.type,
      category: record.category,
      date: toDateInputValue(record.date),
      notes: record.notes ?? "",
    });
    setFormErrors({});
    setFormApiError("");
    setIsModalOpen(true);
  }

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormApiError("");
  }, []);

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormApiError("");

    const validationErrors = validateForm(form);
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const amountInCents = Math.round(Number(form.amount) * 100);
      // Backend expects ISO 8601 datetime string for date field
      const isoDate = toISODatetime(form.date);

      if (editingRecord) {
        const payload: UpdateRecordPayload = {
          amount: amountInCents,
          type: form.type,
          category: form.category.trim(),
          date: isoDate,
          notes: form.notes.trim() || null,
        };
        await updateRecord(editingRecord.id, payload);
      } else {
        const payload: CreateRecordPayload = {
          amount: amountInCents,
          type: form.type,
          category: form.category.trim(),
          date: isoDate,
          notes: form.notes.trim() || null,
        };
        await createRecord(payload);
      }

      closeModal();
      void fetchRecords(currentPage);
    } catch (err: unknown) {
      const fieldErrors = extractFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
      } else {
        setFormApiError(extractApiError(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Delete handlers ──────────────────────────────────────────────────────
  function confirmDelete(id: string) {
    setDeletingId(id);
  }

  const cancelDelete = useCallback(() => {
    setDeletingId(null);
  }, []);

  async function handleDelete() {
    if (!deletingId) return;
    setIsDeleting(true);

    try {
      await deleteRecord(deletingId);
      setDeletingId(null);
      void fetchRecords(currentPage);
    } catch (err: unknown) {
      setError(extractApiError(err));
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Pagination helpers ───────────────────────────────────────────────────
  const totalPages = meta.totalPages;
  const startRecord = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const endRecord = Math.min(meta.page * meta.limit, meta.total);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-md">
        {/* Type */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Type
          </label>
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as "" | "INCOME" | "EXPENSE")
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Category
          </label>
          <input
            type="text"
            placeholder="e.g. Food"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* From */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            From
          </label>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* To */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            To
          </label>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Buttons */}
        <Button variant="primary" onClick={handleApplyFilters}>
          Apply
        </Button>
        <Button variant="ghost" onClick={handleResetFilters}>
          Reset
        </Button>

        {/* Spacer + Add Record (ADMIN only) */}
        {isAdmin && (
          <div className="ml-auto">
            <Button
              variant="primary"
              onClick={openAddModal}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
              <svg
                className="mr-1.5 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Record
            </Button>
          </div>
        )}
      </div>

      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <svg
            className="h-8 w-8 animate-spin text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      ) : (
        <>
          {/* ── Table ─────────────────────────────────────────────────── */}
          <div className="overflow-x-auto rounded-xl bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Notes
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 6 : 5}
                      className="px-4 py-12 text-center text-sm text-gray-400"
                    >
                      No records found
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                        {formatDate(record.date)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                        {record.category}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Badge
                          label={record.type}
                          variant={
                            record.type === "INCOME" ? "green" : "red"
                          }
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(record.amount)}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-sm text-gray-500">
                        {record.notes ?? "—"}
                      </td>
                      {isAdmin && (
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(record)}
                              className="rounded-md p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50"
                              aria-label="Edit record"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete(record.id)}
                              className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50"
                              aria-label="Delete record"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ────────────────────────────────────────────── */}
          {meta.total > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {startRecord}–{endRecord}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">{meta.total}</span>{" "}
                records
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Add/Edit Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRecord ? "Edit Record" : "Add Record"}
      >
        {formApiError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formApiError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
          <Input
            label="Amount (₹)"
            name="amount"
            type="number"
            placeholder="e.g. 5000"
            value={form.amount}
            onChange={(e) => {
              setForm((f) => ({ ...f, amount: e.target.value }));
              if (formErrors.amount)
                setFormErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            error={formErrors.amount}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as "INCOME" | "EXPENSE",
                }))
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <Input
            label="Category"
            name="category"
            type="text"
            placeholder="e.g. Salary, Food, Rent"
            value={form.category}
            onChange={(e) => {
              setForm((f) => ({ ...f, category: e.target.value }));
              if (formErrors.category)
                setFormErrors((prev) => ({ ...prev, category: undefined }));
            }}
            error={formErrors.category}
          />

          <Input
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={(e) => {
              setForm((f) => ({ ...f, date: e.target.value }));
              if (formErrors.date)
                setFormErrors((prev) => ({ ...prev, date: undefined }));
            }}
            error={formErrors.date}
          />

          <div>
            <label
              htmlFor="notes"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Add any notes…"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {editingRecord ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ───────────────────────────────────── */}
      <Modal
        isOpen={deletingId !== null}
        onClose={cancelDelete}
        title="Delete Record"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this record? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={isDeleting}
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
