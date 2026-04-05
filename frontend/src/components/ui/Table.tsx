import type { ReactNode } from "react";

interface Column {
  key: string;
  label: string;
}

interface TableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  renderCell?: (key: string, row: Record<string, unknown>) => ReactNode;
}

export default function Table({ columns, data, renderCell }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={
                  typeof row["id"] === "string" || typeof row["id"] === "number"
                    ? String(row["id"])
                    : rowIndex
                }
                className="transition-colors hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="whitespace-nowrap px-4 py-3 text-sm text-gray-700"
                  >
                    {renderCell
                      ? renderCell(col.key, row)
                      : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
