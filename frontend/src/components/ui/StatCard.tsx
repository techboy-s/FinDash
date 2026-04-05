import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  color?: "green" | "red" | "blue" | "gray";
  icon?: ReactNode;
}

const accentClasses: Record<string, string> = {
  green: "bg-green-500",
  red: "bg-red-500",
  blue: "bg-indigo-500",
  gray: "bg-gray-400",
};

const textClasses: Record<string, string> = {
  green: "text-green-600",
  red: "text-red-600",
  blue: "text-indigo-600",
  gray: "text-gray-600",
};

export default function StatCard({
  title,
  value,
  color = "gray",
  icon,
}: StatCardProps) {
  return (
    <div className="relative flex overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg">
      {/* Left accent bar */}
      <div className={`w-1.5 shrink-0 ${accentClasses[color] ?? accentClasses.gray}`} />

      <div className="flex flex-1 items-center gap-4 p-5">
        {/* Icon */}
        {icon && (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-opacity-10 ${textClasses[color] ?? textClasses.gray} bg-current/10`}
          >
            {icon}
          </div>
        )}

        {/* Text */}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-500">{title}</p>
          <p
            className={`mt-1 text-2xl font-bold ${textClasses[color] ?? textClasses.gray}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
