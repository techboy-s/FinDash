interface BadgeProps {
  label: string;
  variant?: "green" | "red" | "yellow" | "gray";
}

const variantClasses: Record<string, string> = {
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  yellow: "bg-yellow-100 text-yellow-800",
  gray: "bg-gray-100 text-gray-800",
};

export default function Badge({ label, variant = "gray" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant] ?? variantClasses.gray}`}
    >
      {label}
    </span>
  );
}
