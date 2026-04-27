import { twMerge } from "tailwind-merge";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "premium";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  premium: "bg-brand-navy-light text-brand-navy font-semibold",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={twMerge("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs", variantClasses[variant], className)}
    >
      {children}
    </span>
  );
}
